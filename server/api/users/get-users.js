import pool from "../../utils/db";

export default defineEventHandler(async (event) => {
  // Set CORS headers agar endpoint bisa diakses dari frontend
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "*", // Ganti * dengan origin frontend jika perlu
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  // Handle preflight OPTIONS request
  if (event.node.req.method === "OPTIONS") {
    return "";
  }

  // Ambil semua data user dari database
  const res = await pool.query("SELECT * FROM users");
  return { users: res.rows };
});