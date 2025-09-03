// server/api/email/send-simple.js
import { sendEmail } from '../../utils/emailService';

export default defineEventHandler(async (event) => {
  // CORS headers
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS", 
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  if (event.node.req.method === "OPTIONS") {
    return "";
  }

  try {
    const body = await readBody(event);
    const { to, subject, html } = body;

    if (!to || !subject) {
      return {
        success: false,
        error: 'Missing required fields: to, subject'
      };
    }

    console.log('Simple email endpoint called');
    
    const result = await sendEmail({ 
      to, 
      subject, 
      html: html || '<p>Test email</p>' 
    });

    return {
      success: result.success,
      message: result.success ? 'Email sent' : result.error,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Simple email error:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
});
