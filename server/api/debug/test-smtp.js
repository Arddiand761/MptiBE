// server/api/debug/test-smtp.js
import nodemailer from 'nodemailer';

export default defineEventHandler(async (event) => {
  console.log('=== SMTP CONNECTION TEST ===');
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log('Testing SMTP connection...');
    
    // Test connection only (no email sending)
    const isConnected = await transporter.verify();
    
    return {
      success: true,
      connected: isConnected,
      message: 'SMTP connection successful',
      email_user: process.env.EMAIL_USER,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('SMTP connection failed:', error);
    
    return {
      success: false,
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      timestamp: new Date().toISOString()
    };
  }
});
