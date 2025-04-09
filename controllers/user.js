const adminUserRepo = require("../repositories/admin_users_repo");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { knexRead, knex } = require("../data/knex/index");
const { SingletonCache } = require("../helpers/cache");

const { razorpay } = require("../services/razorpay/index");

let myCache = new SingletonCache().getInstance();

const createUser = async (req, res) => {
  const trx = await knex.transaction();
  try {
    const body = req.body;
    let validator = Joi.object({
      password: Joi.string()
        .pattern(new RegExp(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,20}$/))
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
      message: "something went wrong while creating admin user! Please try again.",
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

    const validPassword = await bcrypt.compare(body.password, adminUser.password);
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
            email: adminUser.email,
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
      message: "something went wrong while deleting admin user! Please try again.",
      data: null,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    await adminUserRepo.updateAdminUser({ user_id: req.user.user_id }, { loggedout_at: knexRead.fn.now() });
    await myCache.del(`${req.user.role_id}-routes`);
    return res.status(200).json({ status: true, message: "Logged out successfully.", data: null });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      status: false,
      message: err.message,
      data: null,
    });
  }
};


const checkoutItem = async (req, res) => {
  const trx = await knex.transaction();
  try {
    const { amount } = req.body;
    
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };
 

    await trx.commit();
    
  try {
    const order = await razorpay.orders.create(options);

    console.log('order', order);
    // await db('orders').insert({
    //   razorpay_order_id: order.id,
    //   amount: order.amount,
    //   status: 'created',
    // });

    res.json(order);
  } catch (err) {
    console.error({ err });
    res.status(500).json({ error: 'Error creating Razorpay order' });
  }
  } catch (err) {
    await trx.rollback();
    console.error(err);
    return res.status(500).json({
      status: false,
      message: "something went wrong while creating admin user! Please try again.",
      data: null,
    });
  }
};

module.exports = {
  createUser,
  login,
  deleteUser,
  logoutUser,

  checkoutItem
};
