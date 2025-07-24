import pool from "../../utils/db.js";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  if (event.node.req.method === "OPTIONS") {
    return "";
  }

  if (event.node.req.method !== "DELETE") {
    throw createError({ statusCode: 405, statusMessage: "Method Not Allowed" });
  }

  try {
    const query = getQuery(event);
    const booking_id = query.booking_id;
    if (!booking_id) {
      throw createError({
        statusCode: 400,
        statusMessage: "booking_id is required",
      });
    }

    // Optional: Only allow owner or admin to delete
    let user_id = null;
    const authHeader = getHeader(event, "authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user_id = decoded.userId;
      } catch (error) {
        // ignore, treat as guest
      }
    }

    // Check if booking exists
    const bookingCheck = await pool.query(
      "SELECT booking_id, user_id FROM bookings WHERE booking_id = $1",
      [booking_id]
    );
    if (bookingCheck.rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Booking not found",
      });
    }

    // Optional: Only allow owner or admin to delete
    if (
      user_id &&
      bookingCheck.rows[0].user_id &&
      bookingCheck.rows[0].user_id !== user_id
    ) {
      throw createError({
        statusCode: 403,
        statusMessage: "Not authorized to delete this booking",
      });
    }

    // Delete booking
    await pool.query("DELETE FROM bookings WHERE booking_id = $1", [
      booking_id,
    ]);

    return {
      success: true,
      message: "Booking deleted successfully",
      booking_id,
    };
  } catch (error) {
    console.error("Error deleting booking:", error);
    throw error;
  }
});
