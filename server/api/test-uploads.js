import fs from "fs";
import path from "path";

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
    // Check if uploads directory exists
    const uploadsDir = path.resolve("./public/uploads");
    const exists = fs.existsSync(uploadsDir);

    if (!exists) {
      return {
        error: "Uploads directory not found",
        path: uploadsDir,
      };
    }

    // List files in uploads directory
    const files = fs.readdirSync(uploadsDir);

    const fileList = files.map((file) => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        url: `http://localhost:3000/uploads/${file}`,
        isFile: stats.isFile(),
      };
    });

    return {
      success: true,
      uploadsDir,
      files: fileList,
      count: files.length,
    };
  } catch (error) {
    console.error("Test uploads error:", error);
    return {
      error: error.message,
      stack: error.stack,
    };
  }
});
