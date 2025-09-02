// server/api/debug/email-config.js
export default defineEventHandler(async (event) => {
  return {
    email_host: process.env.EMAIL_HOST || 'not set',
    email_port: process.env.EMAIL_PORT || 'not set', 
    email_user: process.env.EMAIL_USER ? 'set' : 'not set',
    email_pass: process.env.EMAIL_PASS ? 'set' : 'not set',
    node_env: process.env.NODE_ENV || 'not set',
    timestamp: new Date().toISOString()
  };
});
