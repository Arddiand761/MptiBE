import pool from "../../utils/db.js";

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
    const lawyer_id = query.lawyer_id;

    if (!lawyer_id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Lawyer ID is required"
      });
    }

    const result = await pool.query(
      `SELECT lawyer_id, name, specialty, experience, rating, fee, old_fee, photo, available, created_at
       FROM lawyers 
       WHERE lawyer_id = $1 AND available = true`,
      [lawyer_id]
    );

    if (result.rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Lawyer not found or not available"
      });
    }

    return {
      success: true,
      lawyer: result.rows[0]
    };
  } catch (error) {
    console.error("Error getting lawyer:", error);
    throw error;
  }
});