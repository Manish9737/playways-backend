const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

const sendEmail = async (to, subject, html) => {
  try {

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.Email,
        pass: process.env.PassWordEmail,
      },
    });

    const mailOptions = {
      from: '"Playways" <' + process.env.Email + ">",
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = sendEmail;
