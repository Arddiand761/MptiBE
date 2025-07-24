import db from "../../utils/db";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  // Tangani preflight CORS (OPTIONS)
  if (event.req.method === "OPTIONS") {
    setResponseHeaders(event, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    setResponseStatus(event, 200);
    return "";
  }

  // Header CORS untuk semua request
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  // Ambil token dari header Authorization
  const authHeader =
    event.node.req.headers["authorization"] ||
    event.node.req.headers["Authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    setResponseStatus(event, 401);
    return { success: false, message: "Unauthorized" };
  }
  const token = authHeader.split(" ")[1];
  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    userId = decoded.user_id || decoded.id || decoded.userId;
    if (!userId) throw new Error("Invalid token payload");
  } catch (err) {
    setResponseStatus(event, 401);
    return { success: false, message: "Invalid token" };
  }

  try {
    // Ambil semua booking milik user ini
    const bookings = await db.query(
      `SELECT b.*, l.name AS lawyer_name, l.specialty AS specialty
   FROM bookings b
   LEFT JOIN lawyers l ON b.lawyer_id = l.lawyer_id
   WHERE b.user_id = $1
   ORDER BY b.created_at DESC`,
      [userId]
    );
    return { success: true, bookings: bookings.rows };
  } catch (err) {
    setResponseStatus(event, 500);
    return { success: false, message: "Database error", error: err.message };
  }
});
