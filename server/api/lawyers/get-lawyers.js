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
    const search = query.search || '';
    const limit = parseInt(query.limit) || 50;
    const offset = parseInt(query.offset) || 0;

    let sqlQuery;
    let queryParams;

    if (search) {
      // Search by name or specialty
      sqlQuery = `
        SELECT lawyer_id, name, specialty, experience, rating, fee, old_fee, photo, available, created_at
        FROM lawyers 
        WHERE available = true 
        AND (name ILIKE $1 OR specialty ILIKE $1)
        ORDER BY rating DESC, experience DESC
        LIMIT $2 OFFSET $3
      `;
      queryParams = [`%${search}%`, limit, offset];
    } else {
      // Get all available lawyers
      sqlQuery = `
        SELECT lawyer_id, name, specialty, experience, rating, fee, old_fee, photo, available, created_at
        FROM lawyers 
        WHERE available = true
        ORDER BY rating DESC, experience DESC
        LIMIT $1 OFFSET $2
      `;
      queryParams = [limit, offset];
    }

    const result = await pool.query(sqlQuery, queryParams);

    // Get total count for pagination
    const countQuery = search 
      ? `SELECT COUNT(*) FROM lawyers WHERE available = true AND (name ILIKE $1 OR specialty ILIKE $1)`
      : `SELECT COUNT(*) FROM lawyers WHERE available = true`;
    
    const countParams = search ? [`%${search}%`] : [];
    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    return {
      success: true,
      lawyers: result.rows,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: (offset + limit) < totalCount
      }
    };

  } catch (error) {
    console.error("Error getting lawyers:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error"
    });
  }
});