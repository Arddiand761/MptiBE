// tests/user-api.test.js
import { describe, it, expect } from "vitest";
import supertest from "supertest";

// arahkan ke Nuxt server yang sedang berjalan
const api = supertest("http://localhost:3000");

const testEmail = `test_${Date.now()}@example.com`;
const testPassword = "password123";

describe("User API - Register and Login", () => {
  let token = "";

  it("should register a new user", async () => {
    const res = await api.post("/api/users/post-users").send({
      action: "register",
      name: "Test User",
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
      role:"users",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should login with correct credentials", async () => {
    const res = await api.post("/api/users/post-users").send({
      action: "login",
      email: testEmail,
      password: testPassword,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();

    token = res.body.token;
  });

  it("should not login with wrong password", async () => {
    const res = await api.post("/api/users/post-users").send({
      action: "login",
      email: testEmail,
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(undefined);
  });
});