import pool from "../../utils/db.js";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  if (event.node.req.method === "OPTIONS") {
    return "";
  }

  try {
    const body = await readBody(event);
    const authHeader = getHeader(event, 'authorization');
    
    // Validate required fields
    const { lawyer_id, nama_pembooking, email, nomor_handphone, tanggal_booking, waktu_booking, pesan } = body;
    
    if (!lawyer_id || !nama_pembooking || !email || !nomor_handphone || !tanggal_booking || !waktu_booking) {
      throw createError({
        statusCode: 400,
        statusMessage: "All required fields must be filled"
      });
    }

    // Get user_id from token (optional - bisa null jika guest booking)
    let user_id = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user_id = decoded.userId;
      } catch (error) {
        console.warn('Invalid token, creating guest booking');
      }
    }

    // Check if lawyer exists and available
    const lawyerCheck = await pool.query(
      "SELECT lawyer_id FROM lawyers WHERE lawyer_id = $1 AND available = true",
      [lawyer_id]
    );

    if (lawyerCheck.rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Lawyer not found or not available"
      });
    }

    // Check for time conflicts
    const conflictCheck = await pool.query(
      "SELECT booking_id FROM bookings WHERE lawyer_id = $1 AND tanggal_booking = $2 AND waktu_booking = $3 AND status IN ('pending', 'approved')",
      [lawyer_id, tanggal_booking, waktu_booking]
    );

    if (conflictCheck.rows.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: "Time slot already booked"
      });
    }

    // Insert booking
    const insertQuery = `
      INSERT INTO bookings (lawyer_id, user_id, nama_pembooking, email, nomor_handphone, tanggal_booking, waktu_booking, pesan, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING booking_id, lawyer_id, nama_pembooking, email, tanggal_booking, waktu_booking, status
    `;

    const result = await pool.query(insertQuery, [
      lawyer_id, user_id, nama_pembooking, email, nomor_handphone, tanggal_booking, waktu_booking, pesan || null
    ]);

    return {
      success: true,
      message: "Booking created successfully",
      booking: result.rows[0]
    };

  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
});