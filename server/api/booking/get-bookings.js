import pool from "../../utils/db.js";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  if (event.node.req.method === "OPTIONS") {
    return "";
  }

  try {
    const query = getQuery(event);
    const limit = parseInt(query.limit) || 10;
    const offset = parseInt(query.offset) || 0;
    const status = query.status; // optional filter by status
    const authHeader = getHeader(event, 'authorization');

    // Verify admin authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication required"
      });
    }

    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
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

    // Build query
    let sqlQuery = `
      SELECT 
        b.booking_id,
        b.nama_pembooking,
        b.email,
        b.nomor_handphone,
        b.tanggal_booking,
        b.waktu_booking,
        b.pesan,
        b.status,
        b.created_at,
        b.updated_at,
        l.name as lawyer_name,
        l.specialty,
        u.name as user_name
      FROM bookings b
      LEFT JOIN lawyers l ON b.lawyer_id = l.lawyer_id
      LEFT JOIN users u ON b.user_id = u.users_id
    `;

    let queryParams = [];
    let paramIndex = 1;

    // Add status filter if provided
    if (status) {
      sqlQuery += ` WHERE b.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    // Add ordering and pagination
    sqlQuery += ` ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(sqlQuery, queryParams);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM bookings b`;
    let countParams = [];
    
    if (status) {
      countQuery += ` WHERE b.status = $1`;
      countParams.push(status);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    return {
      success: true,
      bookings: result.rows,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: (offset + limit) < totalCount
      }
    };

  } catch (error) {
    console.error("Error getting bookings:", error);
    throw error;
  }
});
