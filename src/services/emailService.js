const resetPasswordTemplate = ({ name, resetPasswordUrl }) => {
  return `
    <html>
      <body>
        <p>Hi ${name || "there"},</p>
        <p>We received a request to reset your password. Click the link below to reset it:</p>
        <p><a href="${resetPasswordUrl}">Reset password</a></p>
        <p>If you didn't request this, ignore this email.</p>
      </body>
    </html>
  `;
};

module.exports = { resetPasswordTemplate };
