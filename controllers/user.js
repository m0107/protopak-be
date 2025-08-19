const adminUserRepo = require("../repositories/admin_users_repo");
const userProductsRepo = require("../repositories/user_products_repo");
const shoppingCartRepo = require("../repositories/shopping_cart_repo");
const shippingAddressRepo = require("../repositories/shipping_address_repo");
const ordersRepo = require("../repositories/orders_repo");
const userSubscriptionsRepo = require("../repositories/user_subscriptions_repo");
const subscriptionsrepo = require("../repositories/subscriptions_repo");
const downloadDinelineRepo = require("../repositories/download_dineline_repo");
const userOrdersRepo = require("../repositories/user_orders_repo");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { knexRead, knex } = require("../data/knex/index");
const { SingletonCache } = require("../helpers/cache");
const { createId } = require("@paralleldrive/cuid2");
const { v4: uuidv4 } = require("uuid");
const { razorpay } = require("../services/razorpay/index");
// const { razorpay } = require("../services/razorpay/index");
const {
  getUserProjects,
  exportProjectsAsPDF,
  exportProjectsAsKnife,
  exportProjectsAsAi,
  exportProjectsAsDxf,
  checkPdfStatus,
  checkAiStatus,
  // checkDxfStatus,
  // checkKnifeStatus,
} = require("../services/pacdora");
const googleAuth = require("../services/google_auth");
const passwordHelper = require("../helpers/passwordGenerator");
const crypto = require("crypto");

let myCache = new SingletonCache().getInstance();

const createUser = async (req, res) => {
  const trx = await knex.transaction();
  try {
    const body = req.body;
    let validator = Joi.object({
      password: Joi.string()
        .pattern(
          new RegExp(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,20}$/)
        )
        .required(),
      //
      email: Joi.string()
        .pattern(
          new RegExp(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          )
        )
        .required(),
      cnf_password: Joi.ref("password"),
    }).with("password", "cnf_password");
    validator = validator.validate({
      // username: body.username,
      password: body.password,
      email: body.email,
      cnf_password: body.cnf_password,
      // role_id: body.role_id,
    });
    if (validator.error) {
      await trx.rollback();
      return res.status(400).json({
        status: false,
        message: validator.error.message,
        data: null,
      });
    }
    const adminUserExist = await adminUserRepo.readAdminByEmail(body.email);
    if (adminUserExist) {
      await trx.rollback();
      return res.status(400).json({
        status: false,
        message: "Email already exists!",
        data: null,
      });
    }
    const salt = await bcrypt.genSalt(10);
    body.password = await bcrypt.hash(body.password, salt);
    const adminUser = await adminUserRepo.createAdminUser(
      {
        // username: body.username,
        password: body.password,
        email: body.email,
        pacdora_user_id: createId(),
        // role_id: body.role_id,
        // branch_id: body.branch_id ? body.branch_id : null,
        // created_by: req.user.user_id,
        // updated_by: req.user.user_id,
      },
      { trx }
    );

    await trx.commit();
    return res.status(200).json({
      status: true,
      message: "User created successfully.",
      data: adminUser,
    });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    return res.status(500).json({
      status: false,
      message:
        "something went wrong while creating admin user! Please try again.",
      data: null,
    });
  }
};

const login = async (req, res) => {
  try {
    const body = req.body;
    console.log("login body", body);

    let validator = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });
    validator = validator.validate({
      email: body.email,
      password: body.password,
    });
    if (validator.error) {
      console.log(validator.error);
      return res.status(400).json({
        status: false,
        message: validator.error.message,
        data: null,
      });
    }

    let adminUser = await adminUserRepo.readAdminByEmail(body.email);

    if (!adminUser) {
      return res.status(400).json({
        status: false,
        message: "Email not registerd",
        data: null,
      });
    }

    const validPassword = await bcrypt.compare(
      body.password,
      adminUser.password
    );
    if (validPassword) {
      //TODO: If email is not vrified send login faild, need to verify email

      const token = await jwt.sign(
        {
          id: adminUser.user_id,
          email: adminUser.email,
        },
        process.env.JWT_TOKEN,
        {
          expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRY),
        }
      );

      //TODO: Add Last login cloumn
      // await adminUserRepo.updateAdminUser(
      //   { user_id: adminUser.user_id },
      //   { last_login: knexRead.fn.now(), loggedout_at: null }
      // );

      await myCache.del(adminUser.user_id);
      //TODO: Encrypt the data object to string
      return res
        .status(200)
        .header("Access-Control-Expose-Headers", "token")
        .setHeader("token", token)
        .json({
          status: true,
          message: "Login successful.",
          data: {
            user_id: adminUser.user_id,
            email: adminUser.email,
            pacdora_user_id: adminUser.pacdora_user_id,
          },
        });
    } else {
      return res.status(400).json({
        status: false,
        message: "Invalid credentials!",
        data: null,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: false,
      message: "something went wrong while logging in! Please try again.",
      data: null,
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    // g_auth_token
    //googleAuth.verifyToken

    const body = req.body;
    let validator = Joi.object({
      g_auth_token: Joi.string().required(),
    });
    validator = validator.validate({
      g_auth_token: body.g_auth_token,
    });

    if (validator.error) {
      return res.status(400).json({
        status: false,
        message: validator.error.message,
        data: null,
      });
    }

    const googleAuthVerifyTokenResult = await googleAuth.verifyToken(
      body.g_auth_token
    );

    console.log("googleAuthVerifyTokenResult", googleAuthVerifyTokenResult);

    let adminUser = await adminUserRepo.readAdminByEmail(
      googleAuthVerifyTokenResult.email
    );

    console.log("adminUser", adminUser);

    if (!adminUser) {
      return res.status(400).json({
        status: false,
        message: "Email not registerd",
        data: null,
      });
    } else {
      const token = await jwt.sign(
        {
          id: adminUser.user_id,
          email: adminUser.email,
        },
        process.env.JWT_TOKEN,
        {
          expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRY),
        }
      );

      return res
        .status(200)
        .header("Access-Control-Expose-Headers", "token")
        .setHeader("token", token)
        .json({
          status: true,
          message: "Login successful.",
          data: {
            user_id: adminUser.user_id,
            email: adminUser.email,
            pacdora_user_id: adminUser.pacdora_user_id,
          },
        });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: false,
      message: "something went wrong while logging in! Please try again.",
      data: null,
    });
  }
};

const googleSignup = async (req, res) => {
  console.log("googleSignup()");
  try {
    const body = req.body;
    let validator = Joi.object({
      g_auth_token: Joi.string().required(),
    });
    validator = validator.validate({
      g_auth_token: body.g_auth_token,
    });

    if (validator.error) {
      return res.status(400).json({
        status: false,
        message: validator.error.message,
        data: null,
      });
    }

    const googleAuthVerifyTokenResult = await googleAuth.verifyToken(
      body.g_auth_token
    );

    const { email } = googleAuthVerifyTokenResult;

    const adminUserExist = await adminUserRepo.readAdminByEmail(email);
    if (adminUserExist) {
      return res.status(400).json({
        status: false,
        message: "Email already exists!",
        data: null,
      });
    }

    const adminUser = await adminUserRepo.createAdminUser({
      password: passwordHelper.generatePassword(12),
      email: email,
      pacdora_user_id: createId(),
    });

    const token = await jwt.sign(
      {
        id: adminUser.user_id,
        email: adminUser.email,
      },
      process.env.JWT_TOKEN,
      {
        expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRY),
      }
    );

    return res
      .status(200)
      .header("Access-Control-Expose-Headers", "token")
      .setHeader("token", token)
      .json({
        status: true,
        message: "Registered Succssfully!.",
        data: {
          user_id: adminUser.user_id,
          email: adminUser.email,
          pacdora_user_id: adminUser.pacdora_user_id,
        },
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: false,
      message: "something went wrong while logging in! Please try again.",
      data: null,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const body = req.body;
    await adminUserRepo.deleteAdminUser({
      user_id: body.user_id,
    });
    return res.status(200).json({
      status: true,
      message: "User deleted successfully.",
      data: null,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      status: false,
      message:
        "something went wrong while deleting admin user! Please try again.",
      data: null,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    await adminUserRepo.updateAdminUser(
      { user_id: req.user.user_id },
      { loggedout_at: knexRead.fn.now() }
    );
    await myCache.del(`${req.user.role_id}-routes`);
    return res
      .status(200)
      .json({ status: true, message: "Logged out successfully.", data: null });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      status: false,
      message: err.message,
      data: null,
    });
  }
};

const userProfile = async (req, res) => {
  // const trx = await knex.transaction();
  try {
    const { user_id } = req.body;

    const user = await adminUserRepo.readAdminUserById(user_id);
    console.log(user);
  } catch (err) {
    // await trx.rollback();
    console.error(err);
    return res.status(500).json({
      status: false,
      message:
        "something went wrong while creating admin user! Please try again.",
      data: null,
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const { user_products_id } = req.body;

    const { user_id } = req.user;

    const itemAlreadyInCart =
      await shoppingCartRepo.findOneShoppingCartByFilter({
        user_products_id,
      });

    console.log({ itemAlreadyInCart });

    if (itemAlreadyInCart) {
      return res.status(400).json({
        status: false,
        message: "Item already exists in cart",
        data: itemAlreadyInCart,
      });
    }

    const result = await shoppingCartRepo.createShoppingCart({
      user_id,
      user_products_id,
      is_selected: true,
    });

    return res.status(200).json({
      status: true,
      message: "Added to Shopping Cart.",
      data: result,
    });
  } catch (err) {
    // await trx.rollback();
    console.error(err);
    return res.status(500).json({
      status: false,
      message:
        "something went wrong while creating admin user! Please try again.",
      data: null,
    });
  }
};

//

const addShippingAddress = async (req, res) => {
  try {
    const { first_line, street_name, post_code } = req.body;
    // console.log("req.body", req.body);

    const { user_id } = req.user;

    const result = await shippingAddressRepo.createShippingAddress({
      first_line,
      street_name,
      post_code,
      user_id,
    });

    return res.status(200).json({
      status: true,
      message: "Added to Shopping Cart.",
      data: result,
    });
  } catch (err) {
    // await trx.rollback();
    console.error(err);
    return res.status(500).json({
      status: false,
      message:
        "something went wrong while creating admin user! Please try again.",
      data: null,
    });
  }
};

const getShippingAddress = async (req, res) => {
  try {
    const { user_id } = req.user;
    const result = await shippingAddressRepo.getUserShoppingCart(user_id);

    return res.status(200).json({
      status: true,
      message: "getched Shippiing addresses",
      data: result,
    });
  } catch (err) {
    // await trx.rollback();
    console.error(err);
    return res.status(500).json({
      status: false,
      message:
        "something went wrong while creating admin user! Please try again.",
      data: null,
    });
  }
};

const updateProjectDetails = async (req, res) => {
  // const trx = await knex.transaction();
  try {
    const { project_id } = req.body;

    const { user_id } = req.user;

    const projects = await getUserProjects({
      userId: req.user.pacdora_user_id,
      projectId: [project_id],
    });

    console.log({ project_id });
    // console.log("**********", projects, projects.data);
    const project = projects.data[0];
    console.log("project", project);

    //pdf_file_url
    // ai_file_url

    const {
      size,
      size_options,
      price,
      quantity,
      quantity_options,
      print,
      print_options,
      printSides,
      printSides_options,
      material,
      material_options,
      finishing,
      finishing_options,
      delivery,
      delivery_options,
    } = req.body;

    const userProjuctObj = {
      project_id,
      user_id,
      size,
      size_options: JSON.stringify(size_options),
      price: price,
      quantity: quantity,
      quantity_options: JSON.stringify(quantity_options),
      printSides: printSides,
      printSides_options: JSON.stringify(printSides_options),
      print,
      print_options: JSON.stringify(print_options),
      material: material,
      material_options: JSON.stringify(material_options),
      finishing,
      finishing_options: JSON.stringify(finishing_options),
      delivery,
      delivery_options: JSON.stringify(delivery_options),
      image_url: project.screenshot,
      project_name: project.name,
    };

    if (size !== project.size) {
      //Change the product dieline after changing size
      let downloadResult =
        await downloadDinelineRepo.getDielineDownloadsByFilter({
          project_id: String(project_id),
        });
      if (downloadResult.length) {
        downloadResult = downloadResult[0];
        console.log("Removing Previous Dieline download urls!");
        await downloadDinelineRepo.updateDielineDownloads(
          downloadResult.dieline_downloads_id,
          {
            pdf_task_id: null,
            pdf_file_url: null,
            // ai_task_id: null,
            // ai_file_url: null,
            dxf_task_id: null,
            dxf_file_url: null,
          }
        );
      }
    }

    console.log(req.body, "insert into database", userProjuctObj);

    //TODO: To Check if project is present use - user_products_id
    const isProjectPresent = await userProductsRepo.findProductByFilter({
      project_id,
    });
    console.log({ isProjectPresent });
    let result;
    if (isProjectPresent) {
      console.log("updateProject...");
      result = await userProductsRepo.updateProject({
        ...isProjectPresent,
        ...userProjuctObj,
      });
    } else {
      console.log("insertProject...");
      result = await userProductsRepo.insertProject(userProjuctObj);
    }

    const updatedData = await userProductsRepo.findProductByFilter({
      project_id,
    });

    console.log("Updateresult", result);

    //user_products_id

    // let result = await userProductsRepo.insertProject(userProjuctObj)
    return res.status(200).json({
      status: true,
      message: "Project values updated!.",
      data: updatedData,
    });
  } catch (err) {
    // await trx.rollback();
    console.error(err);
    return res.status(500).json({
      status: false,
      message:
        "something went wrong while creating admin user! Please try again.",
      data: null,
    });
  }
};

const getUserProjectDetails = async (req, res) => {
  // const trx = await knex.transaction();
  try {
    const { project_id } = req.body;

    //TODO: To Check if project is present use - user_products_id
    const isProjectPresent = await userProductsRepo.findProductByFilter({
      project_id,
    });

    if (!isProjectPresent) {
      return res.status(400).json({
        status: true,
        message: "Invalid Project Id!.",
        data: {},
      });
    }

    return res.status(200).json({
      status: true,
      message: "fetched value",
      data: isProjectPresent,
    });
  } catch (err) {
    // await trx.rollback();
    console.error(err);
    return res.status(500).json({
      status: false,
      message:
        "something went wrong while creating admin user! Please try again.",
      data: null,
    });
  }
};

const shoppingCartList = async (req, res) => {
  // const trx = await knex.transaction();
  try {
    const { user_id } = req.user;

    const usersShoppingCart = await shoppingCartRepo.getUserShoppingCart(
      user_id
    );

    console.log({ usersShoppingCart });

    return res.status(200).json({
      status: true,
      message: "Shopping Cart List Fetch Successfully",
      data: usersShoppingCart,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message:
        "something went wrong while creating admin user! Please try again.",
      data: null,
    });
  }
};

const removeFromCart = async (req, res) => {
  // const trx = await knex.transaction();
  try {
    // const {
    //   user_id
    // } = req.user;

    const { shopping_cart_id } = req.body;

    const usersShoppingCart = await shoppingCartRepo.deleteCartItem(
      shopping_cart_id
    );

    console.log({ usersShoppingCart });

    return res.status(200).json({
      status: true,
      message: "Shopping Cart List Fetch Successfully",
      data: usersShoppingCart,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message:
        "something went wrong while creating admin user! Please try again.",
      data: null,
    });
  }
};

const checkout = async (req, res) => {
  // const trx = await knex.transaction();
  try {
    const { user_id } = req.user;
    // const { shipping_address_id } = req.body;

    const usersShoppingCart = await shoppingCartRepo.getUserShoppingCart(
      user_id
    );

    let amount = usersShoppingCart.reduce(
      (sum, item) => sum + Number(item.price),
      0
    );

    amount = Math.round(amount);

    console.log("amount", amount, amount * 100, typeof amount);

    const receiptTemp = uuidv4();

    const OrderOptions = {
      amount: amount * 100,
      currency: "USD",
      receipt: receiptTemp, // your internal reference
    };

    // const orderObj = {
    //   shipping_address_id,
    //   user_id,
    //   order_status: 'created',

    //   ...OrderOptions
    // }
    // console.log({
    //   orderObj
    // });
    // // console.log('creating order..', OrderOptions);

    // return;
    console.log("createing order");
    const order = await razorpay.orders.create(OrderOptions);
    console.log(order);
    await myCache.set(`user_receipt_${user_id}`, receiptTemp, 600); // 600 seconds = 10 minutes
    return res.status(200).json({
      status: true,
      message: "Create Checkout Order",
      data: { order },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: "something went wrong while creating checkout",
      data: null,
    });
  }
};
//shoppingCartList

const verifyPayment = async (req, res) => {
  // const trx = await knex.transaction();
  try {
    const { user_id } = req.user;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,

      amount,
      currency,
      receipt,

      shipping_address_id,
      entity,
    } = req.body;

    const orderObj = {
      order_id: receipt,
      user_id,
      order_status: "success",

      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,

      amount,
      currency,
      shipping_address_id,

      payment_method: entity,
    };

    console.log({ orderObj });

    console.log("verifyPayment req.body", req.body);

    const userReceipt = await myCache.get(`user_receipt_${user_id}`);
    console.log("userReceipt", { userReceipt, receipt });
    if (userReceipt === receipt) {
      console.log("receipt matched!");
      // await getReceiptDetails(receipt);
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    console.log("secret", secret);

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    const isVerified = generatedSignature === razorpay_signature;
    console.log("isVerified", isVerified);

    if (!isVerified) {
      return res.status(400).json({
        status: false,
        message: "invalid payment request",
        data: null,
      });
    }

    const order = await ordersRepo.createOrder(orderObj);
    console.log({ order });
    const usersShoppingCartList = await shoppingCartRepo.getUserShoppingCart(
      user_id
    );
    console.log({ usersShoppingCartList });
    for (let cartItem of usersShoppingCartList) {
      console.log("cartItem create user-order");
      //project_id
      await userOrdersRepo.createUserOrder({
        order_id: order.order_id,
        user_products_id: cartItem.user_products_id,
      });
      console.log("cartItem deleting from cart!");
      await shoppingCartRepo.deleteCartItem(cartItem.cart_id);
      //also delete project id from pacdora ?
    }

    return res.status(200).json({
      status: true,
      message: "Order Successfully Placed",
      data: order,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: "something went wrong while creating checkout",
      data: null,
    });
  }
};

//

const getOrders = async (req, res) => {
  // const trx = await knex.transaction();
  try {
    const { user_id } = req.user;

    const usersShoppingCart = await ordersRepo.getUserOrders(user_id);

    console.log({ usersShoppingCart });

    return res.status(200).json({
      status: true,
      message: "orders List Fetch Successfully",
      data: usersShoppingCart,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message:
        "something went wrong while creating admin user! Please try again.",
      data: null,
    });
  }
};

const getSubscriptions = async (req, res) => {
  try {
    const usersShoppingCart = await subscriptionsrepo.getSubscriptions();

    console.log({ usersShoppingCart });

    return res.status(200).json({
      status: true,
      message: "subscription List Fetch Successfully",
      data: usersShoppingCart,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: "something went wrong while fetching subscription list.",
      data: null,
    });
  }
};

const getUserSubscriptions = async (req, res) => {
  try {
    const { user_id } = req.user;

    const usersShoppingCart =
      await userSubscriptionsRepo.getSubscriptionByFilter({
        user_id,
      });

    console.log({ usersShoppingCart });

    return res.status(200).json({
      status: true,
      message: "subscription List Fetch Successfully",
      data: usersShoppingCart,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: "something went wrong while fetching subscription list.",
      data: null,
    });
  }
};

const buySubscription = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { subscription_id } = req.body;

    const subscriptionDetails = await subscriptionsrepo.getSubscriptionById(
      subscription_id
    );

    let amount = subscriptionDetails.amount;

    amount = Math.round(amount);

    const receiptTemp = uuidv4();

    const OrderOptions = {
      amount: amount * 100,
      currency: "USD",
      receipt: receiptTemp, // your internal reference
    };

    const order = await razorpay.orders.create(OrderOptions);

    await myCache.set(`user_subscription_receipt_${user_id}`, receiptTemp, 600);
    return res.status(200).json({
      status: true,
      message: "Create Subscription Order Successful",
      data: { order },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: "something went wrong while creating checkout",
      data: null,
    });
  }
};

const verifySubscriptionPayment = async (req, res) => {
  // const trx = await knex.transaction();
  try {
    const { user_id } = req.user;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,

      amount,
      currency,
      receipt,

      entity,
      subscription_id,
    } = req.body;

    const orderObj = {
      user_subscription_id: receipt,
      user_id,
      order_status: "paid",

      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,

      amount,
      currency,
      subscription_id,
      payment_method: entity,
    };

    console.log({ orderObj });

    console.log("verifyPayment req.body", req.body);

    const userReceipt = await myCache.get(
      `user_subscription_receipt_${user_id}`
    );
    console.log("userReceipt", { userReceipt, receipt });
    if (userReceipt === receipt) {
      console.log("receipt matched!");
      // await getReceiptDetails(receipt);
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    console.log("secret", secret);

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    const isVerified = generatedSignature === razorpay_signature;
    console.log("isVerified", isVerified);

    if (!isVerified) {
      return res.status(400).json({
        status: false,
        message: "invalid payment request",
        data: null,
      });
    }

    const subsccriptionOrder = await userSubscriptionsRepo.createOrder(
      orderObj
    );

    console.log("subsccriptionOrder", subsccriptionOrder);

    // const order = await ordersRepo.createOrder(orderObj);
    // console.log({ order });
    // const usersShoppingCartList = await shoppingCartRepo.getUserShoppingCart(
    //   user_id
    // );
    // console.log({ usersShoppingCartList });
    // for (let cartItem of usersShoppingCartList) {
    //   console.log("cartItem create user-order");
    //    await userOrdersRepo.createUserOrder({
    //     order_id: order.order_id,
    //     user_products_id: cartItem.user_products_id,
    //   });
    //   console.log("cartItem deleting from cart!");
    //   await shoppingCartRepo.deleteCartItem(cartItem.cart_id);
    //  }

    return res.status(200).json({
      status: true,
      message: "Order Successfully Placed",
      data: subsccriptionOrder,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: "something went wrong while creating checkout",
      data: null,
    });
  }
};

const getPendingDielieDownloadCount = async (req, res) => {
  try {
    const { user_id } = req.user;
    const count = await userSubscriptionsRepo.downloadDielineCount(user_id);
    const allowed = parseInt(count.allowed_downloads) || 0;
    const used = parseInt(count.used_downloads) || 0;
    const remaining = allowed - used;
    console.log("count", count);
    return res.status(200).json({
      status: true,
      message: "Create Subscription Order Successful",
      data: { remaining, total: allowed, used },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: "something went wrong while creating checkout",
      data: null,
    });
  }
};

const isUserTokenValid = async (req, res) => {
  try {
    // const { user_id } = req.user;
    return res.status(200).json({
      status: true,
      message: "User token is valid!",
      data: req.user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: "something went wrong while creating checkout",
      data: null,
    });
  }
};

const getUserDieline = async (req, res) => {
  try {
    const { user_id } = req.user;
    const userDielines = await downloadDinelineRepo.getDielineDownloadsByFilter(
      {
        user_id,
      }
    );
    return res.status(200).json({
      status: true,
      message: "Successfully Fetched!",
      data: userDielines,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: "something went wrong while creating checkout",
      data: null,
    });
  }
};

const downloadDieline = async (req, res) => {
  // console.log(">>>>>getPacdoraProducts");
  try {
    const { user_id } = req.user;
    const { project_id } = req.body;

    let downloadResult = await downloadDinelineRepo.getDielineDownloadsByFilter(
      {
        project_id: String(project_id),
      }
    );

    downloadResult = downloadResult.length ? downloadResult[0] : null;
    // if (downloadResult.length) downloadResult = downloadResult[0];

    // console.log("downloadResult", downloadResult);

    if (
      downloadResult &&
      downloadResult.pdf_task_id &&
      downloadResult.dxf_task_id
    ) {
      // downloadResult = downloadResult[0];
      // console.log("^^^^^Project Exists!");
      console.log("checking&Updating dieline files from taskid!");
      const updates = {};

      if (!downloadResult.pdf_file_url) {
        console.log("Checking Pdf file status!");
        const pdfStatus = await checkPdfStatus(downloadResult.pdf_task_id);
        if (pdfStatus.data && pdfStatus.data.filePath) {
          updates.pdf_file_url = pdfStatus.data.filePath;
        } else {
          console.error(
            "checkPdfStatus",
            downloadResult.pdf_task_id,
            pdfStatus
          );
        }
      }

      if (!downloadResult.ai_file_url) {
        const aiStatus = await checkAiStatus(downloadResult.pdf_task_id);
        if (aiStatus.data && aiStatus.data.filePath) {
          updates.pdf_file_url = aiStatus.data.filePath;
        } else {
          console.error("checkAiStatus", downloadResult.pdf_task_id, aiStatus);
        }
      }

      // if (!downloadResult.dxf_file_url) {
      //   const dsfStatus = await checkDxfStatus(downloadResult.pdf_task_id);
      //   console.log("dsfStatus", dsfStatus);
      //   if (dsfStatus.data && dsfStatus.data.filePath) {
      //     updates.dxf_file_url = dsfStatus.data.filePath;
      //   }
      // }

      // console.log("updates obj ", updates, Object.keys(updates).length);

      // if (!downloadResult.knife_file_url) {
      //   const knifeStatus = await checkKnifeStatus(downloadResult.pdf_task_id);
      //   console.log("knifeStatus", knifeStatus);
      //   if (knifeStatus.data && knifeStatus.data.filePath) {
      //     updates.knife_file_url = knifeStatus.data.filePath;
      //   }
      // }

      if (Object.keys(updates).length) {
        let res = await downloadDinelineRepo.updateDielineDownloads(
          downloadResult.dieline_downloads_id,
          updates
        );
        console.log("updateDielineDownloads res", res);
        // return res.status(200).json({
        //   status: true,
        //   message: "Dieline Download",
        //   data: res,
        // });
      }

      return res.status(200).json({
        status: true,
        message:
          "Dieline download has been initiated. Your file will be ready soon",
        data: downloadResult,
      });
    }

    const { allowed_downloads, used_downloads } =
      await userSubscriptionsRepo.downloadDielineCount(user_id);
    const remaining = parseInt(allowed_downloads) - parseInt(used_downloads);
    console.log(
      "downloads remaining",
      { allowed_downloads, used_downloads },
      remaining
    );

    if (!(remaining >= 1)) {
      return res.status(400).json({
        status: false,
        message:
          "Dieline download is unavailable. Please purchase a plan to enable downloads.",
        data: null,
      });
    }

    // console.log("req.body", req.body);
    const userProjectsDetails = await userProductsRepo.findProductByFilter({
      project_id: project_id,
    });
    // console.log("userProjectsDetails", userProjectsDetails);
    if (!userProjectsDetails) {
      return res.status(400).json({
        status: false,
        message: "Inavalid Projectid",
        data: null,
      });
    }
    // console.log("userProjectsDetails".userProjectsDetails);
    const pdfExportData = await exportProjectsAsPDF({
      projectIds: [project_id],
    });
    // const knifeExportData = await exportProjectsAsKnife({
    //   projectIds: [project_id],
    // });
    const dxfExportData = await exportProjectsAsDxf({
      projectIds: [project_id],
    });
    // const aiExportData = await exportProjectsAsAi({
    //   projectIds: [project_id],
    // });

    console.log({
      pdfExportData,
      // knifeExportData,
      dxfExportData,
      // aiExportData,
    });

    if (downloadResult) {
      downloadResult = await downloadDinelineRepo.updateDielineDownloads(
        downloadResult.dieline_downloads_id,
        {
          pdf_task_id: pdfExportData.data[0].taskId,
          // pdf_file_url: null,
          // ai_task_id: aiExportData.data[0].taskId,
          // ai_file_url: null,
          dxf_task_id: dxfExportData.data.taskId,
          dxf_file_url: dxfExportData.data.filePath,
        }
      );
    } else {
      const insertObj = {
        user_id,
        user_products_id: userProjectsDetails.user_products_id,
        project_id: project_id,
        pdf_task_id: pdfExportData.data[0].taskId,
        // knife_task_id: knifeExportData.data[0].taskId, //not added to migartaion
        // ai_task_id: aiExportData.data[0].taskId,
        dxf_task_id: dxfExportData.data.taskId,
        dxf_file_url: dxfExportData.data.filePath ?? null,
      };

      downloadResult = await downloadDinelineRepo.createDielineDownloads(
        insertObj
      );
    }

    return res.status(200).json({
      status: true,
      message: "Dieline Download Initiated, Please try again after 1min",
      data: downloadResult,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      status: false,
      message: err.message,
      data: null,
    });
  }
};

module.exports = {
  createUser,
  login,
  googleLogin,
  googleSignup,
  deleteUser,
  logoutUser,

  userProfile,
  addToCart,
  shoppingCartList,
  removeFromCart,
  checkout,

  updateProjectDetails,
  getUserProjectDetails,
  verifyPayment,
  addShippingAddress,
  getShippingAddress,
  getOrders,

  getSubscriptions,
  buySubscription,
  verifySubscriptionPayment,

  getPendingDielieDownloadCount,
  downloadDieline,
  getUserDieline,

  getUserSubscriptions,
  isUserTokenValid
};
