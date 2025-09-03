// server/api/debug/test-email.js
import { sendEmail } from '../../utils/emailService';

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    return { error: 'POST method required' };
  }

  try {
    const body = await readBody(event);
    const { to = 'test@example.com' } = body;

    console.log('Testing email service...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
    
    const result = await sendEmail({
      to,
      subject: 'Test Email from Production',
      html: '<h1>Email service is working!</h1><p>This is a test email.</p>'
    });

    return {
      success: true,
      result,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
});
