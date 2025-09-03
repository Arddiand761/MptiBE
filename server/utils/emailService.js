// server/utils/emailService.js
import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, html }) {
  console.log('=== EMAIL SERVICE DEBUG ===');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('EMAIL_USER set:', !!process.env.EMAIL_USER);
  console.log('EMAIL_PASS set:', !!process.env.EMAIL_PASS);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email credentials missing');
    return { success: false, error: 'Email credentials not configured' };
  }

  try {
    // Simple Gmail configuration
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log('Transporter created, attempting to send...');
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send failed:', error.message);
    return { success: false, error: `Gmail error: ${error.message}` };
  }
}
