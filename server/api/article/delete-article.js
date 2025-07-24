import pool from "../../utils/db.js";

export default defineEventHandler(async (event) => {
  // Add CORS headers
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  if (event.node.req.method === "OPTIONS") {
    return "";
  }

  try {
    // Hanya terima method DELETE
    if (event.node.req.method !== "DELETE") {
      throw createError({
        statusCode: 405,
        statusMessage: "Method Not Allowed",
      });
    }

    // Ambil artikel_id dari query parameters atau body
    const query = getQuery(event);
    let artikel_id = query.artikel_id;

    // Jika tidak ada di query, coba dari body
    if (!artikel_id) {
      const body = await readBody(event);
      artikel_id = body.artikel_id;
    }

    // Validasi artikel_id wajib ada
    if (!artikel_id) {
      throw createError({
        statusCode: 400,
        statusMessage: "artikel_id wajib diisi",
      });
    }

    // Cek apakah artikel ada sebelum menghapus
    const checkQuery =
      "SELECT artikel_id, judul FROM artikel WHERE artikel_id = $1";
    const checkResult = await pool.query(checkQuery, [artikel_id]);

    if (checkResult.rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Artikel tidak ditemukan",
      });
    }

    const articleToDelete = checkResult.rows[0];

    // Execute delete query
    const deleteQuery = "DELETE FROM artikel WHERE artikel_id = $1";
    await pool.query(deleteQuery, [artikel_id]);

    return {
      success: true,
      message: "Artikel berhasil dihapus",
      data: {
        artikel_id: articleToDelete.artikel_id,
        judul: articleToDelete.judul,
        deleted_at: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Error deleting article:", error);

    if (error.statusCode) {
      throw error;
    }

    // Handle foreign key constraint violations
    if (error.code === "23503") {
      throw createError({
        statusCode: 409,
        statusMessage:
          "Artikel tidak dapat dihapus karena masih digunakan oleh data lain",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Terjadi kesalahan server internal",
    });
  }
});
