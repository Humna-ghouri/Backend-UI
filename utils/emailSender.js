import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendWelcomeEmail = async (name, email) => {
  const mailOptions = {
    from: `"Saylani Qarze Hasana" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Qarze Hasana Microfinance Portal',
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #005f87; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Qarze Hasana</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>Thank you for registering with Qarze Hasana Microfinance Portal.</p>
          <p>You can now login to your account and apply for interest-free loans.</p>
          <p>Best regards,</p>
          <p>Saylani Welfare Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Saylani Welfare International Trust</p>
        </div>
      </div>
    </body>
    </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};