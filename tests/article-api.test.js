import { describe, it, expect } from "vitest";
import supertest from "supertest";

const api = supertest("http://localhost:3000");

describe("Artikel API", () => {
  it("GET /api/article/get-articles harus mengembalikan daftar artikel", async () => {
    const res = await api.get("/api/article/get-articles?limit=2&offset=0");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("articles");
    expect(Array.isArray(res.body.articles)).toBe(true);
  });

  it("POST /api/article/post-article gagal jika field kurang", async () => {
    const res = await api
      .post("/api/article/post-article")
      .field("judul", "Artikel Test")
      // Tidak mengirim deskripsi, content_artikel, gambar
      .set("Content-Type", "multipart/form-data");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("statusMessage");
  });
});
