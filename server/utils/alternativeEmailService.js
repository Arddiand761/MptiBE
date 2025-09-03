// server/utils/alternativeEmailService.js
// Alternative email service using SMTP2GO or SendGrid

import nodemailer from 'nodemailer';

export async function sendEmailAlternative({ to, subject, html }) {
  console.log('=== ALTERNATIVE EMAIL SERVICE ===');
  
  try {
    // Option 1: Using SMTP2GO (free 1000 emails/month)
    const transporter = nodemailer.createTransport({
      host: 'mail.smtp2go.com',
      port: 2525, // Alternative port that's less likely to be blocked
      secure: false,
      auth: {
        user: process.env.SMTP2GO_USER, // Add this to Railway
        pass: process.env.SMTP2GO_PASS, // Add this to Railway
      },
    });

    const info = await transporter.sendMail({
      from: `"Anas Law" <${process.env.SMTP2GO_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Alternative email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Alternative email failed:', error.message);
    
    // Fallback to Gmail if alternative fails
    try {
      console.log('Trying Gmail fallback...');
      
      const gmailTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465, // Try secure port instead
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const gmailInfo = await gmailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
      });

      return { success: true, messageId: gmailInfo.messageId };
      
    } catch (gmailError) {
      return { success: false, error: gmailError.message };
    }
  }
}
