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

const passwordResetSuccessTemplate = ({
  name = "User",
  redirectUrl = "http://localhost:5173/login",
}) =>
  baseTemplate(`
    <span class="badge">✅ Password Changed</span>
    <h2>Password Reset Successful</h2>
    <p>Hi ${name},</p>
    <p>Your password has been successfully reset. You can now log in with your new password.</p>
    <a href="${redirectUrl || process.env.CLIENT_URL}/login" class="btn">
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

  const adminEmailTemplate = ({
  subject,
  body,
  adminName = "PlayWays Team",
}) =>
  baseTemplate(`
    <span class="badge">📢 Official Message</span>

    <h2 style="color:#1f2937; font-size:22px; margin-bottom:6px;">
      ${subject}
    </h2>

    <p style="color:#6b7280; font-size:14px; margin-bottom:20px;">
      Hello,
    </p>

    <!-- Message Box -->
    <div style="
      background:#f9fafb;
      border:1px solid #e5e7eb;
      border-left:4px solid #f59e0b;
      border-radius:10px;
      padding:16px;
      margin-bottom:20px;
      line-height:1.7;
      color:#374151;
      font-size:14px;
    ">
      ${body}
    </div>

    <!-- Info Note -->
    <div style="
      background:#eff6ff;
      border:1px solid #bfdbfe;
      border-radius:10px;
      padding:14px;
      margin-bottom:20px;
    ">
      <p style="color:#1e40af; font-size:13px; margin:0;">
        ℹ️ This is an official communication from PlayWays Admin.
        Please do not reply directly to this email.
      </p>
    </div>

    <!-- CTA -->
    <div style="text-align:center; margin:20px 0;">
      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/contactUs"
        style="
          display:inline-block;
          padding:12px 26px;
          background:linear-gradient(135deg,#f59e0b,#f97316);
          color:#fff;
          text-decoration:none;
          border-radius:8px;
          font-size:14px;
          font-weight:bold;
        ">
        Contact Support
      </a>
    </div>

    <hr class="divider"/>

    <!-- Signature -->
    <p style="color:#9ca3af; font-size:13px; line-height:1.8;">
      Regards,<br/>
      <strong style="color:#f59e0b;">${adminName}</strong><br/>
      PlayWays Admin Team
    </p>

    <!-- Security Note -->
    <p style="
      margin-top:12px;
      font-size:12px;
      color:#9ca3af;
      line-height:1.6;
    ">
      🔒 For your security, PlayWays will never ask for your password or OTP via email.
    </p>
  `);

const bookingCancelTemplate = ({
  name,
  bookingId,
  gameStation,
  game,
  date,
  slot,
  duration,
  amount,
  refundNote = "",
}) =>
  baseTemplate(`
    <span class="badge danger">❌ Booking Cancelled</span>

    <h2 style="color:#1f2937; font-size:22px; margin-bottom:6px;">
      Booking Cancelled
    </h2>
    <p style="color:#6b7280; font-size:14px; margin-bottom:20px;">
      Hey <strong style="color:#ef4444;">${name}</strong>, your booking has been successfully cancelled.
      We hope to see you again soon! 🎮
    </p>

    <hr class="divider"/>

    <!-- Cancelled Booking Details -->
    <p style="font-size:13px; font-weight:bold; color:#9ca3af; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">
      📋 Cancelled Booking Details
    </p>
    <table style="width:100%; border-collapse:collapse; font-size:14px; border-radius:10px; overflow:hidden;">
      <tr style="background:#f9fafb;">
        <td style="padding:12px 14px; color:#6b7280; width:40%; border-bottom:1px solid #f3f4f6;">Booking ID</td>
        <td style="padding:12px 14px; color:#1f2937; font-weight:bold; border-bottom:1px solid #f3f4f6; font-family:monospace;">
          #${bookingId}
        </td>
      </tr>
      <tr>
        <td style="padding:12px 14px; color:#6b7280; border-bottom:1px solid #f3f4f6;">Game Station</td>
        <td style="padding:12px 14px; color:#1f2937; font-weight:bold; border-bottom:1px solid #f3f4f6;">
          ${gameStation}
        </td>
      </tr>
      <tr style="background:#f9fafb;">
        <td style="padding:12px 14px; color:#6b7280; border-bottom:1px solid #f3f4f6;">Game</td>
        <td style="padding:12px 14px; color:#1f2937; font-weight:bold; border-bottom:1px solid #f3f4f6;">
          🕹️ ${game}
        </td>
      </tr>
      <tr>
        <td style="padding:12px 14px; color:#6b7280; border-bottom:1px solid #f3f4f6;">Date</td>
        <td style="padding:12px 14px; color:#1f2937; font-weight:bold; border-bottom:1px solid #f3f4f6;">
          📅 ${date}
        </td>
      </tr>
      <tr style="background:#f9fafb;">
        <td style="padding:12px 14px; color:#6b7280; border-bottom:1px solid #f3f4f6;">Slot Time</td>
        <td style="padding:12px 14px; color:#1f2937; font-weight:bold; border-bottom:1px solid #f3f4f6;">
          ⏰ ${slot}
        </td>
      </tr>
      <tr>
        <td style="padding:12px 14px; color:#6b7280;">Duration</td>
        <td style="padding:12px 14px; color:#1f2937; font-weight:bold;">
          ⏱️ ${duration} minutes
        </td>
      </tr>
    </table>

    <hr class="divider"/>

    <!-- Cancellation Status -->
    <div style="background:linear-gradient(135deg,#fef2f2,#fee2e2); border:1px solid #fca5a5; border-radius:12px; padding:20px; margin-bottom:20px;">
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <tr>
          <td style="padding:8px 0; color:#991b1b;">Cancellation Status</td>
          <td style="padding:8px 0; text-align:right;">
            <span style="background:#ef4444; color:#fff; padding:3px 12px; border-radius:20px; font-size:12px; font-weight:bold;">
              ❌ CANCELLED
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0; color:#991b1b;">Amount Paid</td>
          <td style="padding:8px 0; color:#7f1d1d; font-weight:bold; text-align:right; font-size:18px;">
            ₹${amount || 0}
          </td>
        </tr>
        ${
          refundNote
            ? `
        <tr>
          <td colspan="2" style="border-top:1px dashed #fca5a5; padding-top:12px;"></td>
        </tr>
        <tr>
          <td colspan="2" style="padding:8px 0; color:#991b1b; font-size:13px;">
            💳 <strong>Refund Note:</strong> ${refundNote}
          </td>
        </tr>`
            : `
        <tr>
          <td colspan="2" style="border-top:1px dashed #fca5a5; padding-top:12px;"></td>
        </tr>
        <tr>
          <td colspan="2" style="padding:8px 0; color:#991b1b; font-size:13px;">
            💳 <strong>Refund:</strong> If applicable, refunds will be processed within 5–7 business days.
          </td>
        </tr>`
        }
      </table>
    </div>

    <!-- CTA Buttons -->
    <div style="text-align:center; margin:20px 0;">
      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/gameStations"
        style="display:inline-block; margin:0 8px; padding:12px 24px; background:linear-gradient(135deg,#f59e0b,#f97316); color:#fff; text-decoration:none; border-radius:8px; font-size:14px; font-weight:bold;">
        🎮 Book Again
      </a>
      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/contactUs"
        style="display:inline-block; margin:0 8px; padding:12px 24px; background:#1f2937; color:#f59e0b; text-decoration:none; border-radius:8px; font-size:14px; font-weight:bold;">
        🙋 Contact Support
      </a>
    </div>

    <hr class="divider"/>

    <p style="color:#9ca3af; font-size:13px; text-align:center; line-height:1.8;">
      We're sorry to see you go this time. Hope to see you back soon!<br/>
      <strong style="color:#f59e0b;">The PlayWays Team</strong>
    </p>
  `);

// const adminEmailTemplate = ({ subject, body }) =>
//   baseTemplate(`
//     <span class="badge">📧 Message from PlayWays Admin</span>
//     <h2>${subject}</h2>
//     <p>${body}</p>
//     <hr class="divider"/>
//     <p style="color:#9ca3af; font-size:13px;">
//       This message was sent by the PlayWays Admin Team.
//     </p>
//   `);

const bookingSuccessTemplate = ({
  name,
  bookingId,
  gameStation,
  game,
  date,
  slot,
  duration,
  amount,
  paymentId,
  orderId,
  address,
  city,
}) =>
  baseTemplate(`
    <span class="badge">🎮 Booking Confirmed</span>

    <h2 style="color:#1f2937; font-size:22px; margin-bottom:6px;">
      Your Adventure Awaits! 🎉
    </h2>
    <p style="color:#6b7280; font-size:14px; margin-bottom:20px;">
      Hey <strong style="color:#f59e0b;">${name}</strong>, your booking is confirmed and ready to go!
      Get ready for an epic gaming experience.
    </p>

    <hr class="divider"/>

    <!-- Booking Details -->
    <p style="font-size:13px; font-weight:bold; color:#9ca3af; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">
      📋 Booking Details
    </p>
    <table style="width:100%; border-collapse:collapse; font-size:14px; border-radius:10px; overflow:hidden;">
      <tr style="background:#f9fafb;">
        <td style="padding:12px 14px; color:#6b7280; width:40%; border-bottom:1px solid #f3f4f6;">Booking ID</td>
        <td style="padding:12px 14px; color:#1f2937; font-weight:bold; border-bottom:1px solid #f3f4f6; font-family:monospace;">
          #${bookingId}
        </td>
      </tr>
      <tr>
        <td style="padding:12px 14px; color:#6b7280; border-bottom:1px solid #f3f4f6;">Game Station</td>
        <td style="padding:12px 14px; color:#1f2937; font-weight:bold; border-bottom:1px solid #f3f4f6;">
          ${gameStation}
        </td>
      </tr>
      <tr style="background:#f9fafb;">
        <td style="padding:12px 14px; color:#6b7280; border-bottom:1px solid #f3f4f6;">Address</td>
        <td style="padding:12px 14px; color:#1f2937; border-bottom:1px solid #f3f4f6;">
          ${address}, ${city}
        </td>
      </tr>
      <tr>
        <td style="padding:12px 14px; color:#6b7280; border-bottom:1px solid #f3f4f6;">Game</td>
        <td style="padding:12px 14px; color:#1f2937; font-weight:bold; border-bottom:1px solid #f3f4f6;">
          🕹️ ${game}
        </td>
      </tr>
      <tr style="background:#f9fafb;">
        <td style="padding:12px 14px; color:#6b7280; border-bottom:1px solid #f3f4f6;">Date</td>
        <td style="padding:12px 14px; color:#1f2937; font-weight:bold; border-bottom:1px solid #f3f4f6;">
          📅 ${date}
        </td>
      </tr>
      <tr>
        <td style="padding:12px 14px; color:#6b7280; border-bottom:1px solid #f3f4f6;">Slot Time</td>
        <td style="padding:12px 14px; color:#1f2937; font-weight:bold; border-bottom:1px solid #f3f4f6;">
          ⏰ ${slot}
        </td>
      </tr>
      <tr style="background:#f9fafb;">
        <td style="padding:12px 14px; color:#6b7280;">Duration</td>
        <td style="padding:12px 14px; color:#1f2937; font-weight:bold;">
          ⏱️ ${duration} minutes
        </td>
      </tr>
    </table>

    <hr class="divider"/>

    <!-- Payment Slip -->
    <p style="font-size:13px; font-weight:bold; color:#9ca3af; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">
      🧾 Payment Receipt
    </p>
    <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); border:1px solid #86efac; border-radius:12px; padding:20px; margin-bottom:20px;">
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <tr>
          <td style="padding:8px 0; color:#166534;">Payment Status</td>
          <td style="padding:8px 0; text-align:right;">
            <span style="background:#22c55e; color:#fff; padding:3px 12px; border-radius:20px; font-size:12px; font-weight:bold;">
              ✅ PAID
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0; color:#166534;">Payment ID</td>
          <td style="padding:8px 0; color:#14532d; font-weight:bold; font-family:monospace; text-align:right;">
            ${paymentId || "—"}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0; color:#166534;">Order ID</td>
          <td style="padding:8px 0; color:#14532d; font-family:monospace; text-align:right; font-size:13px;">
            ${orderId || "—"}
          </td>
        </tr>
        <tr>
          <td colspan="2" style="border-top:1px dashed #86efac; padding-top:12px; margin-top:8px;"></td>
        </tr>
        <tr>
          <td style="padding:4px 0; color:#166534; font-size:17px; font-weight:bold;">
            Total Amount
          </td>
          <td style="padding:4px 0; text-align:right; color:#15803d; font-size:22px; font-weight:bold;">
            ₹${amount}
          </td>
        </tr>
      </table>
    </div>

    <!-- QR / Booking code hint -->
    <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:10px; padding:16px; text-align:center; margin-bottom:20px;">
      <p style="color:#92400e; font-size:13px; margin-bottom:6px; font-weight:bold;">
        📱 Show this Booking ID at the station
      </p>
      <p style="color:#d97706; font-size:24px; font-weight:bold; font-family:monospace; letter-spacing:4px;">
        #${bookingId}
      </p>
      <p style="color:#a16207; font-size:12px; margin-top:4px;">
        Please arrive 10 minutes before your slot time
      </p>
    </div>

    <hr class="divider"/>

    <!-- CTA Buttons -->
    <div style="text-align:center; margin: 20px 0;">
      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/bookings"
        style="display:inline-block; margin:0 8px; padding:12px 24px; background:linear-gradient(135deg,#f59e0b,#f97316); color:#fff; text-decoration:none; border-radius:8px; font-size:14px; font-weight:bold;">
        📋 View My Bookings
      </a>
      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/gameStations"
        style="display:inline-block; margin:0 8px; padding:12px 24px; background:#1f2937; color:#f59e0b; text-decoration:none; border-radius:8px; font-size:14px; font-weight:bold;">
        🎮 Browse Stations
      </a>
    </div>

    <hr class="divider"/>

    <!-- Footer note -->
    <p style="color:#9ca3af; font-size:12px; text-align:center; line-height:1.8;">
      Need to cancel? You can cancel your booking up to 24 hours before the slot time.<br/>
      For support, reply to this email or visit our
      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/contactUs" style="color:#f59e0b;">Help Center</a>.
    </p>

    <p style="color:#9ca3af; font-size:13px; margin-top:16px;">
      See you at the station! 🎮<br/>
      <strong style="color:#f59e0b;">The PlayWays Team</strong>
    </p>
  `);

module.exports = {
  welcomeTemplate,
  otpTemplate,
  passwordResetSuccessTemplate,
  bookingConfirmTemplate,
  bookingCancelTemplate,
  adminEmailTemplate,
  bookingSuccessTemplate,
  adminEmailTemplate,
};
