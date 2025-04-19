const adminUserRepo = require("../repositories/admin_users_repo");
const userProductsRepo = require("../repositories/user_products_repo");
const shoppingCartRepo = require("../repositories/shopping_cart_repo");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { knexRead, knex } = require("../data/knex/index");
const { SingletonCache } = require("../helpers/cache");
const { createId } = require("@paralleldrive/cuid2");
const { v4: uuidv4 } = require("uuid");
const { razorpay, getReceiptDetails } = require("../services/razorpay/index");
// const { razorpay } = require("../services/razorpay/index");
const { getUserProjects } = require("../services/pacdora");

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
    let validator = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });
    validator = validator.validate({
      email: body.email,
      password: body.password,
    });
    if (validator.error) {
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

const updateProjectDetails = async (req, res) => {
  // const trx = await knex.transaction();
  try {
    const { project_id, user_products_id } = req.body;

    const { user_id } = req.user;

    const projects = await getUserProjects({
      userId: req.user.pacdora_user_id,
      projectId: [project_id],
    });

    console.log({ project_id });
    // console.log("**********", projects, projects.data);
    const project = projects.data[0];
    console.log("project", project);

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

    //user_products_id

    // let result = await userProductsRepo.insertProject(userProjuctObj)
    return res.status(200).json({
      status: true,
      message: "Project values updated!.",
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

    const usersShoppingCart = await shoppingCartRepo.getUserShoppingCart(
      user_id
    );

    console.log({ usersShoppingCart });

    const amount = usersShoppingCart.reduce(
      (sum, item) => sum + Number(item.price),
      0
    );
    console.log("amount", amount, amount * 100, typeof amount);

    const receiptTemp = uuidv4();

    const OrderOptions = {
      amount: amount * 100,
      currency: "USD",
      receipt: receiptTemp, // your internal reference
    };
    // console.log('creating order..', OrderOptions);

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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    
    console.log("req.body", req.body);

    const { receipt } = req.body;

    const userReceipt = await myCache.get(`user_receipt_${user_id}`);
    console.log("userReceipt", { userReceipt, receipt });
    if (userReceipt === receipt) {
      await getReceiptDetails(receipt);
    }

    const secret = process.env.RAZORPAY_SECRET;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      console.log("Failed!");
      const orderObj = {
        order_status: "",

        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,

        amount: 0,
        currency: "",
        payment_method: '',
        paid_at:'tiimestamp',
        is_deleted: false,
        metadata: '{}'
      };
    }

    return res.status(200).json({
      status: true,
      message: "Create Checkout Order",
      data: {},
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

module.exports = {
  createUser,
  login,
  deleteUser,
  logoutUser,

  userProfile,
  addToCart,
  shoppingCartList,
  removeFromCart,
  checkout,

  updateProjectDetails,
  verifyPayment,
  // checkoutItem
};
