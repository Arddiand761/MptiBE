export default defineEventHandler(async (event) => {
  // Add CORS headers
  setHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  // Handle OPTIONS request
  if (getMethod(event) === "OPTIONS") {
    return "";
  }

  if (getMethod(event) !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method not allowed",
    });
  }

  try {
    const body = await readBody(event);
    const { articleId } = body;

    if (!articleId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Article ID is required",
      });
    }

    const db = await import("../../utils/db.js").then((m) => m.default);

    // Create views table if it doesn't exist (PostgreSQL syntax)
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS article_views (
          id SERIAL PRIMARY KEY,
          article_id INTEGER,
          viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ip_address TEXT,
          user_agent TEXT,
          is_unique_visitor BOOLEAN DEFAULT true
        )
      `);
    } catch (createTableError) {
      console.log("Table creation info:", createTableError.message);
      // Continue execution even if table creation fails (table might already exist)
    }

    // Validate that article exists before tracking view
    const articleCheck = await db.query(
      "SELECT artikel_id FROM artikel WHERE artikel_id = $1",
      [articleId]
    );
    if (articleCheck.rows.length === 0) {
      return {
        success: false,
        error: "Article not found",
      };
    }

    // Get IP address and User Agent for better visitor identification
    const clientIP = getClientIP(event) || "unknown";
    const userAgent = getHeader(event, "user-agent") || "unknown";

    // Check if this IP has already viewed this article recently (within 24 hours)
    const existingView = await db.query(
      `
      SELECT id FROM article_views 
      WHERE article_id = $1 AND ip_address = $2 
      AND viewed_at > NOW() - INTERVAL '24 hours'
      LIMIT 1
    `,
      [articleId, clientIP]
    );

    const isUniqueVisitor = existingView.rows.length === 0;

    // Insert view record
    await db.query(
      `
      INSERT INTO article_views (article_id, ip_address, user_agent, is_unique_visitor)
      VALUES ($1, $2, $3, $4)
    `,
      [articleId, clientIP, userAgent, isUniqueVisitor]
    );

    return {
      success: true,
      message: "View tracked successfully",
      data: {
        isUniqueVisitor: isUniqueVisitor,
        totalViews: "Updated in background",
      },
    };
  } catch (error) {
    console.error("Error tracking view:", error);
    return {
      success: false,
      error: error.message,
    };
  }
});
