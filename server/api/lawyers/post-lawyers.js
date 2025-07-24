import pool from "../../utils/db.js";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  if (event.node.req.method === "OPTIONS") {
    return "";
  }

  const method = event.node.req.method;

  try {
    if (method === "POST") {
      // Create lawyer with file upload support
      const form = new IncomingForm({
        uploadDir: "./public/uploads/lawyers",
        keepExtensions: true,
        multiples: false,
      });
      // Pastikan folder upload ada
      if (!fs.existsSync("./public/uploads/lawyers")) {
        fs.mkdirSync("./public/uploads/lawyers", { recursive: true });
      }
      const { fields, files } = await new Promise((resolve, reject) => {
        form.parse(event.node.req, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });

      const name = fields.name?.toString().trim();
      const specialty = fields.specialty?.toString().trim();
      const experience = fields.experience ? parseInt(fields.experience) : null;
      const rating = fields.rating ? parseFloat(fields.rating) : null;
      const fee = fields.fee ? parseInt(fields.fee) : null;
      const old_fee = fields.old_fee ? parseInt(fields.old_fee) : null;
      const available =
        fields.available === "true" || fields.available === true;

      // Handle photo upload
      const photoFile = Array.isArray(files.photo)
        ? files.photo[0]
        : files.photo;
      const photoPath =
        photoFile && photoFile.filepath
          ? "/uploads/lawyers/" + path.basename(photoFile.filepath)
          : null;

      if (!name || !specialty || !experience || !fee) {
        throw createError({
          statusCode: 400,
          statusMessage: "Field wajib diisi (name, specialty, experience, fee)",
        });
      }

      const result = await pool.query(
        `INSERT INTO lawyers (name, specialty, experience, rating, fee, old_fee, photo, available)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          name,
          specialty,
          experience,
          rating,
          fee,
          old_fee,
          photoPath,
          available,
        ]
      );
      return { success: true, lawyer: result.rows[0] };
    }
    if (method === "PUT") {
      // Update lawyer (photo update optional)
      const form = new IncomingForm({
        uploadDir: "./public/uploads/lawyers",
        keepExtensions: true,
        multiples: false,
      });
      if (!fs.existsSync("./public/uploads/lawyers")) {
        fs.mkdirSync("./public/uploads/lawyers", { recursive: true });
      }
      const { fields, files } = await new Promise((resolve, reject) => {
        form.parse(event.node.req, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });

      const lawyer_id = fields.lawyer_id ? parseInt(fields.lawyer_id) : null;
      const name = fields.name?.toString().trim();
      const specialty = fields.specialty?.toString().trim();
      const experience = fields.experience ? parseInt(fields.experience) : null;
      const rating = fields.rating ? parseFloat(fields.rating) : null;
      const fee = fields.fee ? parseInt(fields.fee) : null;
      const old_fee = fields.old_fee ? parseInt(fields.old_fee) : null;
      const available =
        fields.available === "true" || fields.available === true;

      // Handle photo upload (optional)
      const photoFile = Array.isArray(files.photo)
        ? files.photo[0]
        : files.photo;
      const photoPath =
        photoFile && photoFile.filepath
          ? "/uploads/lawyers/" + path.basename(photoFile.filepath)
          : null;

      if (!lawyer_id) {
        throw createError({
          statusCode: 400,
          statusMessage: "Lawyer ID is required",
        });
      }

      // Build update query
      const updateFields = [
        "name=$1",
        "specialty=$2",
        "experience=$3",
        "rating=$4",
        "fee=$5",
        "old_fee=$6",
        "available=$7",
      ];
      const values = [
        name,
        specialty,
        experience,
        rating,
        fee,
        old_fee,
        available,
      ];
      let paramCounter = 8;
      if (photoPath) {
        updateFields.push(`photo=$${paramCounter}`);
        values.push(photoPath);
        paramCounter++;
      }
      values.push(lawyer_id);

      const updateQuery = `UPDATE lawyers SET ${updateFields.join(
        ", "
      )} WHERE lawyer_id=$${paramCounter} RETURNING *`;
      const result = await pool.query(updateQuery, values);
      return { success: true, lawyer: result.rows[0] };
    }
    if (method === "DELETE") {
      // Delete lawyer
      const query = getQuery(event);
      const lawyer_id = query.lawyer_id;
      if (!lawyer_id) {
        throw createError({
          statusCode: 400,
          statusMessage: "Lawyer ID is required",
        });
      }
      await pool.query(`DELETE FROM lawyers WHERE lawyer_id = $1`, [lawyer_id]);
      return { success: true };
    }
    if (method === "GET") {
      // List all lawyers (for management, including inactive)
      const query = getQuery(event);
      const limit = parseInt(query.limit) || 50;
      const offset = parseInt(query.offset) || 0;
      const result = await pool.query(
        `SELECT lawyer_id, name, specialty, experience, rating, fee, old_fee, photo, available, created_at
         FROM lawyers
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return { success: true, lawyers: result.rows };
    }
    return { success: false, message: "Method not allowed" };
  } catch (error) {
    console.error("Error in post-lawyers:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
