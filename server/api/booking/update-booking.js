import pool from "../../utils/db.js";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,PUT,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  if (event.node.req.method === "OPTIONS") {
    return "";
  }

  if (!["POST", "PUT", "PATCH"].includes(event.node.req.method)) {
    throw createError({
      statusCode: 405,
      statusMessage: "Method not allowed"
    });
  }

  try {
    const body = await readBody(event);
    const authHeader = getHeader(event, 'authorization');

    // Admin authentication required
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication required"
      });
    }
    let decoded;
    try {
      const token = authHeader.substring(7);
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'admin') {
        throw createError({
          statusCode: 403,
          statusMessage: "Admin access required"
        });
      }
    } catch (error) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid or expired token"
      });
    }

    // Validate booking_id and at least one field to update
    const { booking_id, status, pesan, tanggal_booking, waktu_booking, nama_pembooking, email, nomor_handphone } = body;
    if (!booking_id) {
      throw createError({
        statusCode: 400,
        statusMessage: "booking_id is required"
      });
    }
    // Only allow updating certain fields
    const fields = [];
    const values = [];
    let idx = 1;
    if (status) {
      fields.push(`status = $${idx++}`);
      values.push(status);
    }
    if (pesan !== undefined) {
      fields.push(`pesan = $${idx++}`);
      values.push(pesan);
    }
    if (tanggal_booking) {
      fields.push(`tanggal_booking = $${idx++}`);
      values.push(tanggal_booking);
    }
    if (waktu_booking) {
      fields.push(`waktu_booking = $${idx++}`);
      values.push(waktu_booking);
    }
    if (nama_pembooking) {
      fields.push(`nama_pembooking = $${idx++}`);
      values.push(nama_pembooking);
    }
    if (email) {
      fields.push(`email = $${idx++}`);
      values.push(email);
    }
    if (nomor_handphone) {
      fields.push(`nomor_handphone = $${idx++}`);
      values.push(nomor_handphone);
    }
    if (fields.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No fields to update"
      });
    }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    const updateQuery = `UPDATE bookings SET ${fields.join(", ")} WHERE booking_id = $${idx} RETURNING *`;
    values.push(booking_id);
    const result = await pool.query(updateQuery, values);
    if (result.rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Booking not found"
      });
    }
    return {
      success: true,
      message: "Booking updated successfully",
      booking: result.rows[0]
    };
  } catch (error) {
    console.error("Error updating booking:", error);
    throw error;
  }
});
