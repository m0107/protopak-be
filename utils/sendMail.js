const nodemailer = require("nodemailer");
require("dotenv");
const AWS = require("aws-sdk");

const sendMailOld = async ({ to, otp, subject, body }) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL, // generated ethereal user
        pass: process.env.PASSWORD, // generated ethereal password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: `"LOGIN OTP 👻" <${process.env.EMAIL}>`, // sender address
      to: to, // list of receivers
      subject: subject || "Hello ✔", // Subject line
      text: body || `Your OTP is ${otp}`, // plain text body
      //   html: "<b>Hello world?</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const sendMail = async ({ to, subject, body }) => {
  try {
    let ses = new AWS.SES({
      region: process.env.AWS_S3_BUCKET_REGION,
    });
    let params = {
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: body,
          },
          // Text: {
          //   Charset: "UTF-8",
          //   Data: "This is the message body in text format.",
          // },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      ReplyToAddresses: [],
      Source: process.env.SES_FROM_EMAIL,
    };
    ses.sendEmail(params, function (err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        throw Error("Something went wrong while send otp please try again!");
      } else {
        // console.log(data);// successful response
      } 
      /*
       data = {
        MessageId: "EXAMPLE78603177f-7a5433e7-8edb-42ae-af10-f0181f34d6ee-000000"
       }
       */
    });
  } catch (err) {
    throw err.message;
  }
};

module.exports = { sendMail };
