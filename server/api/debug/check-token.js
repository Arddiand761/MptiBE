// server/api/debug/check-token.js
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      error: "No Bearer token found",
      authHeader: authHeader
    };
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return {
      success: true,
      decoded: decoded,
      role: decoded.role,
      isAdmin: decoded.role === 'admin'
    };
  } catch (error) {
    return {
      error: "Token verification failed",
      message: error.message,
      tokenLength: authHeader.substring(7).length
    };
  }
});
