const request = require("supertest");
const jwt = require("jsonwebtoken");
const { app } = require("../../app");

describe("JWT Authentication Middleware", () => {
  it("rejects request with no token", async () => {
    await request(app).get("/profile").expect(401).expect({ error: "Unauthorized" });
  });

  it("rejects invalid token", async () => {
    await request(app)
      .get("/profile")
      .set("Authorization", "Bearer invalid.token.here")
      .expect(401);
  });

  it("accepts valid token", async () => {
    const token = jwt.sign(
      { id: "user-123", email: "test@routepress.dev" },
      process.env.JWT_SECRET
    );

    const res = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).toEqual({
      id: "user-123",
      email: "test@routepress.dev",
    });
  });
});
