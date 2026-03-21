const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>PlayWays</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
    .wrapper { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #f59e0b, #f97316); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; }
    .header h1 { color: #fff; font-size: 28px; letter-spacing: 2px; }
    .header p  { color: #fef3c7; font-size: 13px; margin-top: 4px; }
    .body { background: #ffffff; padding: 32px 28px; }
    .body h2 { color: #1f2937; font-size: 20px; margin-bottom: 12px; }
    .body p  { color: #4b5563; font-size: 15px; line-height: 1.7; margin-bottom: 12px; }
    .otp-box { background: #fef3c7; border: 2px dashed #f59e0b; border-radius: 10px; text-align: center; padding: 20px; margin: 24px 0; }
    .otp-box span { font-size: 38px; font-weight: bold; color: #d97706; letter-spacing: 8px; }
    .otp-box p { color: #92400e; font-size: 13px; margin-top: 8px; margin-bottom: 0; }
    .btn { display: inline-block; margin: 20px 0; padding: 12px 28px; background: linear-gradient(135deg, #f59e0b, #f97316); color: #fff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: bold; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    .footer { background: #1f2937; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; }
    .footer p { color: #9ca3af; font-size: 12px; line-height: 1.8; }
    .footer a { color: #f59e0b; text-decoration: none; }
    .badge { display: inline-block; background: #d1fae5; color: #065f46; border-radius: 20px; padding: 4px 14px; font-size: 13px; font-weight: bold; margin-bottom: 16px; }
    .badge.warning { background: #fef3c7; color: #92400e; }
    .badge.danger  { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🎮 PlayWays</h1>
      <p>Your Gaming Destination</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} PlayWays. All rights reserved.</p>
      <p>
        <a href="#">Privacy Policy</a> &nbsp;|&nbsp;
        <a href="#">Terms of Service</a> &nbsp;|&nbsp;
        <a href="#">Support</a>
      </p>
      <p style="margin-top:8px; color:#6b7280;">
        If you did not request this email, please ignore it.
      </p>
    </div>
  </div>
</body>
</html>
`;

// ─── Templates ────────────────────────────────────────────────────────────────

const welcomeTemplate = ({ name, role = "user" }) =>
  baseTemplate(`
    <span class="badge">🎉 Welcome</span>
    <h2>Welcome to PlayWays, ${name}!</h2>
    <p>Your <strong>${role}</strong> account has been successfully created.</p>
    <p>You can now explore game stations, book slots, and enjoy the best gaming experience near you.</p>
    <hr class="divider"/>
    <p>Need help getting started?</p>
    <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/contactUs" class="btn">
      Contact Support
    </a>
    <hr class="divider"/>
    <p style="color:#9ca3af; font-size:13px;">
      Regards,<br/><strong style="color:#f59e0b;">PlayWays Team</strong>
    </p>
  `);

const otpTemplate = ({ otp, purpose = "Password Reset" }) =>
  baseTemplate(`
    <span class="badge warning">🔐 OTP Verification</span>
    <h2>${purpose}</h2>
    <p>Hello,</p>
    <p>Use the OTP below to complete your <strong>${purpose.toLowerCase()}</strong>. 
       It will expire in <strong>10 minutes</strong>.</p>
    <div class="otp-box">
      <span>${otp}</span>
      <p>Do not share this OTP with anyone</p>
    </div>
    <p>If you did not request this, please ignore this email or contact support immediately.</p>
  `);

const passwordResetSuccessTemplate = ({ name = "User", redirectUrl="http://localhost:5173/login" }) =>
  baseTemplate(`
    <span class="badge">✅ Password Changed</span>
    <h2>Password Reset Successful</h2>
    <p>Hi ${name},</p>
    <p>Your password has been successfully reset. You can now log in with your new password.</p>
    <a href="${redirectUrl || process.env.CLIENT_URL }/login" class="btn">
      Login Now
    </a>
    <hr class="divider"/>
    <p>If you did not request this change, please contact our support team immediately.</p>
  `);

const bookingConfirmTemplate = ({
  name,
  gameStation,
  game,
  date,
  slot,
  duration,
}) =>
  baseTemplate(`
    <span class="badge">🎮 Booking Confirmed</span>
    <h2>Your Booking is Confirmed!</h2>
    <p>Hi ${name}, your slot has been booked successfully.</p>
    <hr class="divider"/>
    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <tr style="background:#f9fafb;">
        <td style="padding:10px; color:#6b7280; width:40%;">Game Station</td>
        <td style="padding:10px; color:#1f2937; font-weight:bold;">${gameStation}</td>
      </tr>
      <tr>
        <td style="padding:10px; color:#6b7280;">Game</td>
        <td style="padding:10px; color:#1f2937; font-weight:bold;">${game}</td>
      </tr>
      <tr style="background:#f9fafb;">
        <td style="padding:10px; color:#6b7280;">Date</td>
        <td style="padding:10px; color:#1f2937; font-weight:bold;">${date}</td>
      </tr>
      <tr>
        <td style="padding:10px; color:#6b7280;">Slot Time</td>
        <td style="padding:10px; color:#1f2937; font-weight:bold;">${slot}</td>
      </tr>
      <tr style="background:#f9fafb;">
        <td style="padding:10px; color:#6b7280;">Duration</td>
        <td style="padding:10px; color:#1f2937; font-weight:bold;">${duration} min</td>
      </tr>
    </table>
    <hr class="divider"/>
    <p>See you at the station! 🎮</p>
  `);

const bookingCancelTemplate = ({ name, gameStation, date, slot }) =>
  baseTemplate(`
    <span class="badge danger">❌ Booking Cancelled</span>
    <h2>Booking Cancelled</h2>
    <p>Hi ${name}, your booking has been cancelled.</p>
    <hr class="divider"/>
    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <tr style="background:#f9fafb;">
        <td style="padding:10px; color:#6b7280; width:40%;">Game Station</td>
        <td style="padding:10px; color:#1f2937; font-weight:bold;">${gameStation}</td>
      </tr>
      <tr>
        <td style="padding:10px; color:#6b7280;">Date</td>
        <td style="padding:10px; color:#1f2937; font-weight:bold;">${date}</td>
      </tr>
      <tr style="background:#f9fafb;">
        <td style="padding:10px; color:#6b7280;">Slot Time</td>
        <td style="padding:10px; color:#1f2937; font-weight:bold;">${slot}</td>
      </tr>
    </table>
    <hr class="divider"/>
    <p>If this was a mistake, please rebook or contact support.</p>
    <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/gameStations" class="btn">
      Browse Stations
    </a>
  `);

const adminEmailTemplate = ({ subject, body }) =>
  baseTemplate(`
    <span class="badge">📧 Message from PlayWays Admin</span>
    <h2>${subject}</h2>
    <p>${body}</p>
    <hr class="divider"/>
    <p style="color:#9ca3af; font-size:13px;">
      This message was sent by the PlayWays Admin Team.
    </p>
  `);

module.exports = {
  welcomeTemplate,
  otpTemplate,
  passwordResetSuccessTemplate,
  bookingConfirmTemplate,
  bookingCancelTemplate,
  adminEmailTemplate,
};
