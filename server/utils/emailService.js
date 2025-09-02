// server/utils/emailService.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 5000, // 5 seconds  
  socketTimeout: 15000, // 15 seconds
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // For Railway/production environments
  }
});

export async function sendEmail({ to, subject, html }) {
  try {
    console.log('Attempting to send email to:', to);
    
    const info = await transporter.sendMail({
      from: `"Anas Law" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      timeout: 20000 // 20 second timeout for sending
    });
    
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
}
