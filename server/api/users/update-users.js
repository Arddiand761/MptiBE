// file: server/api/users/update-users.js

import pool from "../../utils/db";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== "PUT") {
    return { statusCode: 405, message: "Method Not Allowed" };
  }

  // --- LANGKAH 1: AUTENTIKASI ---
  const authHeader = event.node.req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { statusCode: 401, message: "Akses ditolak. Token tidak tersedia." };
  }
  const token = authHeader.split(" ")[1];

  let loggedInUser;
  try {
    loggedInUser = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return {
      statusCode: 401,
      message: "Token tidak valid atau sudah kadaluwarsa.",
    };
  }

  // --- LANGKAH 2: DAPATKAN DATA DARI BODY & TOKEN ---
  const body = await readBody(event);
  const { name, email } = body; // HAPUS: Tidak perlu lagi id_to_update dari body

  // BARU: ID pengguna yang akan diupdate diambil langsung dari token yang sudah terverifikasi.
  const id_to_update = loggedInUser.users_id;

  if (!name && !email) {
    return {
      statusCode: 400,
      message: "Minimal harus ada nama atau email yang akan diupdate.",
    };
  }

  // --- LANGKAH 3: OTORISASI (Sudah Otomatis) ---
  // Karena kita mengambil ID dari token, kita tidak perlu lagi mengecek hak akses.
  // Pengguna dijamin hanya bisa mengupdate datanya sendiri.

  // --- LANGKAH 4: PROSES KE DATABASE ---
  try {
    // Validasi email baru jika ada
    if (email) {
      const emailCheck = await pool.query(
        `SELECT users_id FROM users WHERE email = $1 AND users_id != $2`,
        [email, id_to_update],
      );
      if (emailCheck.rows.length > 0) {
        return {
          statusCode: 409,
          message: "Email baru sudah digunakan oleh pengguna lain.",
        };
      }
    }

    // Logika untuk membangun query update tetap sama
    const fields = [];
    const values = [];
    let query_parts = [];
    let param_index = 1;

    if (name) {
      query_parts.push(`name = $${param_index++}`);
      values.push(name);
    }
    if (email) {
      query_parts.push(`email = $${param_index++}`);
      values.push(email);
    }

    values.push(id_to_update); // ID untuk klausa WHERE

    const updateQuery = `UPDATE users SET ${query_parts.join(", ")} WHERE users_id = $${param_index} RETURNING users_id, name, email, role`;

    const result = await pool.query(updateQuery, values);

    return {
      statusCode: 200,
      message: "Profil berhasil diupdate.",
      user: result.rows[0],
    };
  } catch (error) {
    console.error("Update user error:", error);
    return { statusCode: 500, message: "Terjadi kesalahan pada server." };
  }
});