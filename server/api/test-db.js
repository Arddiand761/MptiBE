import pool from "../utils/db.js";

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
    // Test database connection
    const testQuery = await pool.query("SELECT NOW()");
    console.log("Database connection successful:", testQuery.rows[0]);

    // Check if artikel table exists and has data
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'artikel'
    `);

    if (tableCheck.rows.length === 0) {
      return {
        error: "Table 'artikel' not found",
        suggestion: "Please create the artikel table first",
      };
    }

    // Get table structure
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'artikel' 
      ORDER BY ordinal_position
    `);

    // Get sample data
    const sampleData = await pool.query("SELECT * FROM artikel LIMIT 3");

    return {
      success: true,
      database_time: testQuery.rows[0].now,
      table_exists: true,
      table_structure: tableStructure.rows,
      sample_data: sampleData.rows,
      total_articles: sampleData.rowCount,
    };
  } catch (error) {
    console.error("Database test error:", error);
    return {
      error: error.message,
      code: error.code,
      detail: error.detail,
    };
  }
});
