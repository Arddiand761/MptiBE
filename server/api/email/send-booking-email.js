// server/api/email/send-booking-email.js
import { sendEmail } from '../../utils/emailService';
import { bookingApprovalTemplate, bookingRejectionTemplate } from '../../utils/emailTemplates';
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
  const { to, subject, type, data } = body;  // Validation
  if (!to || !subject) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: to, subject'
    });
  }
  if (type && !['booking_approval', 'booking_rejection'].includes(type)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid type value'
    });
  }
  if (type && !data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing data for booking email'
    });
  }
  
  let html;
  if (type === 'booking_approval') {
    html = bookingApprovalTemplate(data);
  } else if (type === 'booking_rejection') {
    html = bookingRejectionTemplate(data);
  } else {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid type'
    });
  }
  
  const result = await sendEmail({ to, subject, html });
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
