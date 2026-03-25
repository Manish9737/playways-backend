const Mailjet = require("node-mailjet");
require("dotenv").config();

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

const sendEmail = async (to, subject, html) => {
  try {
    const request = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_FROM_EMAIL,
            Name: process.env.MAILJET_FROM_NAME || "PlayWays",
          },
          To: [
            {
              Email: to,
            },
          ],
          Subject: subject,
          HTMLPart: html,
        },
      ],
    });

    console.log("Email sent successfully");
    return true;
  } catch (error) {
    console.error(
      "Mailjet Error:",
      error.response?.body || error.message
    );
    return false;
  }
};

module.exports = sendEmail;