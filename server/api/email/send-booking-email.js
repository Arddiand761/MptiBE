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
  
  try {
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
  
    console.log('=== EMAIL ENDPOINT DEBUG ===');
    console.log('Sending email to:', to);
    console.log('Email type:', type);
    
    // Reduce timeout to 15 seconds
    const emailPromise = sendEmail({ to, subject, html });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email timeout after 15s')), 15000)
    );
    
    const result = await Promise.race([emailPromise, timeoutPromise]);
    
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
  } catch (error) {
    console.error('Email endpoint error:', error.message);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error: ' + error.message
    });
  }
});
