const Host = require("../../model/hostSchema");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { generateToken } = require("../../middlewares/passportConfig");
const { generateOTP, sendOTP } = require("../users/userController");
const sendEmail = require("../../Email/email");

const registerHost = async (req, res, next) => {
  const { email, password, phone } = req.body;

  if (!email || !phone || !password) {
    return res.status(422).json({ error: "Please fill the fields properly." });
  }

  try {
    const hostExist = await Host.findOne({ email: email });

    if (hostExist) {
      return res
        .status(422)
        .json({ error: "Email already Exist.", success: false });
    } else {
      const Hosts = new Host({
        email,
        phone,
        password,
      });

      const savedHost = await Hosts.save();

      const subject = "Welcome to PlayWays Family.";
      const content = `
        <h2>Dear ${email},</h2>
        <p>Thank you for registering with us!</p>
        <p>Your account has been successfully created.</p>
        <p>Best regards,</p>
        <p>PlayWays Team</p>
        <hr>
        <p>For Support, <a href="http://localhost:3000/contact">Click here</a></p>
      `;

      await sendEmail(email, subject, content);

      console.log("Host is Registered");
      return res.status(200).json({
        message: "Host is Registered",
        success: true,
        host_id: savedHost._id,
        email: savedHost.email,
        phone: savedHost.phone,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const loginHost = async (req, res, next) => {
  const { emailOrPhone, password } = req.body;

  try {
    let host;

    const isEmail = /\S+@\S+\.\S+/.test(emailOrPhone);
    if (isEmail) {
      host = await Host.findOne({ email: emailOrPhone }, "-cpassword");
    } else {
      host = await Host.findOne({ phone: emailOrPhone }, "-cpassword");
    }

    if (!host) {
      return res
        .status(404)
        .json({ message: "Host not found", success: false });
    }

    const isMatch = await bcrypt.compare(password, host.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid password", success: false });
    }

    const hostWithoutPassword = { ...host._doc };
    delete hostWithoutPassword.password;

    return res.status(200).json({
      message: "Login successful",
      success: true,
      host: hostWithoutPassword,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const getHosts = async (req, res, next) => {
  try {
    const hosts = await Host.find();
    res.status(200).json({ hosts });
  } catch (error) {
    console.log({ message: "Internal server error", success: false });
  }
};

const updateHost = async (req, res, next) => {
  const hostId = req.params.id;
  const updateData = req.body;

  try {
    // Find the host by ID
    const host = await Host.findById(hostId);

    if (!host) {
      return res
        .status(404)
        .json({ message: "Host not found", success: false });
    }

    // Update the host's fields with the provided data
    Object.assign(host, updateData);

    await host.save();

    return res
      .status(200)
      .json({ message: "Host data updated successfully", success: true, host });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const deleteHost = async (req, res, next) => {
  const hostId = req.params.id;

  try {
    // Find the host by ID and delete it
    const host = await Host.findByIdAndDelete(hostId);

    if (!host) {
      return res
        .status(404)
        .json({ message: "Host not found", success: false });
    }

    return res
      .status(200)
      .json({ message: "Host deleted successfully", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const logOut = async (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        // Handle any error during logout
        res
          .status(500)
          .json({ message: "Error during logout", success: false });
        return;
      }
      // Logout successful
      res
        .status(200)
        .json({ message: "Logged out successfully", success: true });
    });
  } catch (error) {
    console.log("error in logout:", error);
    res.status(500).json({ message: "Error during logout", success: false });
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(422).json({
      error: "Please provide the email address.",
      success: false,
    });
  }

  try {
    const host = await Host.findOne({ email });

    if (!host) {
      return res.status(404).json({ error: "Host not found.", success: false });
    }

    const otp = generateOTP();
    const sent = await sendOTP(email, otp);

    if (sent) {
      // Save the OTP to the user document in the database
      host.resetPasswordOTP = otp;
      await host.save();

      return res
        .status(200)
        .json({ message: "OTP sent successfully", success: true });
    } else {
      return res
        .status(500)
        .json({ message: "Failed to send OTP", success: false });
    }
  } catch (error) {
    console.error("Error in forgot-password:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  try {
    const host = await Host.findOne({ email: email });

    if (!host) {
      return res.status(404).json({ error: "Host not found.", success: false });
    }

    if (host.resetPasswordOTP !== otp) {
      return res.status(400).json({ error: "Invalid OTP", success: false });
    }

    host.password = newPassword;
    host.resetPasswordOTP = null;
    await host.save();

    const subject = "Password Reset Successful";
    const content = `
      <html>
        <head>
          <style>
            /* Define CSS styles for email */
            body {
              font-family: Arial, sans-serif;
              background-color: #fff;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #333;
            }
            p {
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Password Reset Successful</h1>
            <p>Your password has been successfully reset.</p>
            <p>You can now use your new password to log in to your account.</p>
            <p>If you did not request this password reset, please contact us immediately.</p>
          </div>
        </body>
      </html>
    `;

    await sendEmail(email, subject, content);

    res
      .status(200)
      .json({ message: "Password reset successful.", success: true });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const fetchOTP = async (req, res) => {
  try {
    const { email, OTP } = req.body;

    const host = await Host.findOne({ email });

    if (!host) {
      return res.status(404).json({ success: false, error: "Host not found" });
    }

    if (host.resetPasswordOTP !== OTP) {
      return res.status(400).json({ success: false, error: "Invalid OTP" });
    }

    return res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error fetching OTP:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

module.exports = {
  registerHost,
  loginHost,
  getHosts,
  updateHost,
  deleteHost,
  logOut,
  forgotPassword,
  resetPassword,
  fetchOTP,
};
