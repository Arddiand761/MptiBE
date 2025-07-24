import pool from "../../utils/db.js";
import { getQuery } from "h3";
// Tambahkan base URL dari server backend Anda
// Untuk development, ini biasanya http://localhost:3000
// Untuk produksi, ganti dengan URL domain Anda
const baseUrl = "http://localhost:3000/api";

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
      // TAMBAHKAN INI - ambil query parameters
    const query = getQuery(event);
    const artikel_id = query.artikel_id;
    const limit = query.limit || 10;
    const offset = query.offset || 0;

    let sqlQuery;
    let values = [];


    // ... (logika query Anda tetap sama)
    if (artikel_id) {
      sqlQuery = `
        SELECT artikel_id, judul, deskripsi, gambar, content_artikel, link_artikel, created_at, updated_at
        FROM artikel 
        WHERE artikel_id = $1
      `;
      values = [artikel_id];
    } else {
      sqlQuery = `
        SELECT artikel_id, judul, deskripsi, gambar, content_artikel, link_artikel, created_at, updated_at
        FROM artikel 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
      `;
      values = [parseInt(limit), parseInt(offset)];
    }

    const result = await pool.query(sqlQuery, values);

    console.log("Raw result from database:", result.rows);

    // ----- PERUBAHAN DI SINI -----
    // Ubah path gambar menjadi URL lengkap
    const articlesWithFullUrl = result.rows.map((article) => {
      console.log(
        "Processing article:",
        article.artikel_id,
        "with gambar:",
        article.gambar
      );
      if (article.gambar) {
        // Pastikan tidak ada double slash jika 'gambar' sudah diawali '/'
        const fullUrl = `${baseUrl}${article.gambar}`;
        console.log("Full URL created:", fullUrl);
        article.gambar = fullUrl;
      }
      return article;
    });
    console.log("Articles with full URLs:", articlesWithFullUrl);
    // ----------------------------

    if (artikel_id && result.rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Artikel tidak ditemukan",
      });
    }

    let totalCount = 0;
    if (!artikel_id) {
      const countResult = await pool.query("SELECT COUNT(*) FROM artikel");
      totalCount = parseInt(countResult.rows[0].count);
    }

    return {
      success: true,
      // Gunakan data yang sudah dimodifikasi
      articles: artikel_id ? [articlesWithFullUrl[0]] : articlesWithFullUrl,
      data: artikel_id ? articlesWithFullUrl[0] : articlesWithFullUrl,
      ...(artikel_id
        ? {}
        : {
            pagination: {
              total: totalCount,
              limit: parseInt(limit),
              offset: parseInt(offset),
              totalPages: Math.ceil(totalCount / parseInt(limit)),
            },
          }),
    };
  } catch (error) {
    // ... (kode error handling Anda)
    console.error("Error getting articles:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Terjadi kesalahan server internal",
    });
  }
});
