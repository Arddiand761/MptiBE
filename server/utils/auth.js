// server/utils/auth.js
export function validateAuth(event) {
  const auth = getHeader(event, 'authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: No token provided'
    });
  }
  const token = auth.split(' ')[1];
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Invalid token'
    });
  }
  return token;
}
