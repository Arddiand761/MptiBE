import fs from "fs";
import path from "path";
import { createReadStream } from "fs";

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
    // Get filename from URL path
    const url = event.node.req.url;
    const filename = url.split("/").pop();

    if (!filename) {
      throw createError({
        statusCode: 400,
        statusMessage: "Filename required",
      });
    }

    // Build file path
    const uploadsDir = path.resolve("./public/uploads");
    const filePath = path.join(uploadsDir, filename);

    // Security check - ensure file is within uploads directory
    if (!filePath.startsWith(uploadsDir)) {
      throw createError({
        statusCode: 403,
        statusMessage: "Access denied",
      });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw createError({
        statusCode: 404,
        statusMessage: "File not found",
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not a file",
      });
    }

    // Determine content type
    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";

    switch (ext) {
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      case ".webp":
        contentType = "image/webp";
        break;
    }

    // Set headers
    setResponseHeaders(event, {
      "Content-Type": contentType,
      "Content-Length": stats.size.toString(),
      "Cache-Control": "public, max-age=3600",
    });

    // Return file stream
    return sendStream(event, createReadStream(filePath));
  } catch (error) {
    console.error("File serve error:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
