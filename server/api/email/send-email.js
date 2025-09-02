// server/api/email/send-email.js
import { sendEmail } from '../../utils/emailService';
import { validateAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  // CORS headers
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  // Handle preflight OPTIONS request
  if (event.node.req.method === "OPTIONS") {
    return "";
  }

  // Auth check
  validateAuth(event);
  
  const body = await readBody(event);
  const { to, subject, html, text } = body;
  
  if (!to || !subject || (!html && !text)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: to, subject, html/text'
    });
  }
  
  const result = await sendEmail({ to, subject, html: html || text });
  if (result.success) {
    return {
      success: true,
      message: 'Email sent successfully',
      data: {
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
      },
    };
  } else {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send email: ' + result.error
    });
  }
});
