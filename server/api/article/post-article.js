import pool from "../../utils/db.js";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";

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
    if (event.node.req.method !== "POST") {
      throw createError({
        statusCode: 405,
        statusMessage: "Method Not Allowed",
      });
    }

    // Parse multipart form
    const form = new IncomingForm({
      uploadDir: "./public/uploads",
      keepExtensions: true,
    });
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(event.node.req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    console.log("FIELDS:", fields);
    console.log("FILES:", files);

    const judul = fields.judul?.toString().trim();
    const deskripsi = fields.deskripsi?.toString().trim();
    const content_artikel = fields.content_artikel?.toString().trim(); // TAMBAHKAN INI
    const link_artikel = fields.link_artikel
      ? fields.link_artikel.toString().trim()
      : null;
    const gambarFile = Array.isArray(files.gambar)
      ? files.gambar[0]
      : files.gambar;

    if (!judul || !deskripsi || !content_artikel || !gambarFile || !gambarFile.filepath) {
      throw createError({
        statusCode: 400,
        statusMessage: "Semua field wajib diisi dan file gambar harus valid",
      });
    }

    const gambarPath = "/uploads/" + path.basename(gambarFile.filepath);

    // Query sesuai tabel: judul, deskripsi, gambar, link_artikel
    const query = `
      INSERT INTO artikel (judul, deskripsi, content_artikel, gambar, link_artikel, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING artikel_id, judul, deskripsi, content_artikel, gambar, link_artikel, created_at, updated_at
    `;
    const values = [judul, deskripsi, content_artikel, gambarPath, link_artikel];

    const result = await pool.query(query, values);

    return {
      success: true,
      message: "Artikel berhasil disimpan",
      data: result.rows[0],
    };
  } catch (error) {
    console.error("Error posting article:", error);

    if (error.statusCode) throw error;
    if (error.code === "23505") {
      throw createError({
        statusCode: 409,
        statusMessage: "Artikel dengan judul tersebut sudah ada",
      });
    }
    if (error.code === "23514") {
      throw createError({
        statusCode: 400,
        statusMessage: "Data tidak sesuai dengan format yang diharapkan",
      });
    }
    if (error.code === "23502") {
      throw createError({
        statusCode: 400,
        statusMessage: "Data wajib tidak boleh kosong",
      });
    }
    if (error.code === "22001") {
      throw createError({
        statusCode: 400,
        statusMessage: "Data melebihi panjang maksimum yang diizinkan",
      });
    }
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      throw createError({
        statusCode: 503,
        statusMessage: "Database tidak dapat diakses",
      });
    }
    if (error.code) {
      throw createError({
        statusCode: 500,
        statusMessage: "Terjadi kesalahan database",
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Terjadi kesalahan server internal",
    });
  }
});
