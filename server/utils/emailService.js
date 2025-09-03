// server/utils/emailService.js
import nodemailer from 'nodemailer';

// Create transporter with better error handling
let transporter;

try {
  transporter = nodemailer.createTransport({
    service: 'gmail', // Use service instead of host/port for Gmail
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    timeout: 30000, // 30 seconds
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  });
} catch (error) {
  console.error('Failed to create email transporter:', error);
}

export async function sendEmail({ to, subject, html }) {
  if (!transporter) {
    console.error('Email transporter not initialized');
    return { success: false, error: 'Email service not available' };
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email credentials not set');
    return { success: false, error: 'Email credentials not configured' };
  }

  try {
    console.log('Sending email to:', to);
    console.log('Email user:', process.env.EMAIL_USER);
    
    const info = await transporter.sendMail({
      from: `"Anas Law" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error response:', error.response);
    return { success: false, error: error.message };
  }
}
