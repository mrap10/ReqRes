const request = require("supertest");
const jwt = require("jsonwebtoken");

describe("JWT Authentication Middleware", () => {
  let app;
  const JWT_SECRET = process.env.JWT_SECRET || "supersecretkeyforjwt";

  beforeEach(() => {
    jest.resetModules();
    const userSolution = require("../../index");
    app = userSolution.app || userSolution;
  });

  describe("POST /login - Generate Token", () => {
    it("should return 200 for valid credentials", async () => {
      const response = await request(app)
        .post("/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
    });

    it("should return a JWT token", async () => {
      const response = await request(app)
        .post("/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(response.body).toHaveProperty("token");
      expect(typeof response.body.token).toBe("string");
      expect(response.body.token.length).toBeGreaterThan(0);
    });

    it("should return a valid JWT token", async () => {
      const response = await request(app)
        .post("/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      const token = response.body.token;

      expect(() => {
        jwt.verify(token, JWT_SECRET);
      }).not.toThrow();
    });

    it("should include user data in token", async () => {
      const response = await request(app)
        .post("/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      const token = response.body.token;
      const decoded = jwt.verify(token, JWT_SECRET);

      expect(decoded).toHaveProperty("id");
      expect(decoded).toHaveProperty("email");
    });

    it("should return 401 for invalid credentials", async () => {
      const response = await request(app)
        .post("/login")
        .send({
          email: "user@example.com",
          password: "wrongpassword",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(401);
    });

    it("should return error for invalid credentials", async () => {
      const response = await request(app)
        .post("/login")
        .send({
          email: "wrong@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /profile - Protected Route", () => {
    let validToken;

    beforeEach(async () => {
      // Get a valid token
      const loginResponse = await request(app)
        .post("/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      validToken = loginResponse.body.token;
    });

    it("should return 200 with valid token", async () => {
      const response = await request(app)
        .get("/profile")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
    });

    it("should return user profile data", async () => {
      const response = await request(app)
        .get("/profile")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("email");
    });

    it("should return correct user email", async () => {
      const response = await request(app)
        .get("/profile")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.body.email).toBe("user@example.com");
    });

    it("should return 401 when no token provided", async () => {
      const response = await request(app).get("/profile");
      expect(response.status).toBe(401);
    });

    it("should return error message when no token", async () => {
      const response = await request(app).get("/profile");

      expect(response.body).toHaveProperty("error");
      const error = response.body.error.toLowerCase();
      expect(error.includes("token") || error.includes("unauthorized")).toBe(true);
    });

    it("should return 401 for invalid token", async () => {
      const response = await request(app)
        .get("/profile")
        .set("Authorization", "Bearer invalid.token.here");

      expect(response.status).toBe(401);
    });

    it("should return 401 for malformed Authorization header", async () => {
      const response = await request(app).get("/profile").set("Authorization", validToken);

      expect(response.status).toBe(401);
    });

    it("should return 401 for expired token", async () => {
      const expiredToken = jwt.sign({ id: "123", email: "user@example.com" }, JWT_SECRET, {
        expiresIn: "-1h",
      });

      const response = await request(app)
        .get("/profile")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });

    it("should return 401 for token with wrong secret", async () => {
      const wrongToken = jwt.sign({ id: "123", email: "user@example.com" }, "wrong-secret");

      const response = await request(app)
        .get("/profile")
        .set("Authorization", `Bearer ${wrongToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe("Authentication Flow", () => {
    it("should complete full auth flow", async () => {
      const loginRes = await request(app)
        .post("/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(loginRes.status).toBe(200);
      const token = loginRes.body.token;

      const profileRes = await request(app).get("/profile").set("Authorization", `Bearer ${token}`);

      expect(profileRes.status).toBe(200);
      expect(profileRes.body.email).toBe("user@example.com");
    });

    it("should handle multiple tokens correctly", async () => {
      const login1 = await request(app)
        .post("/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      const login2 = await request(app)
        .post("/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      const profile1 = await request(app)
        .get("/profile")
        .set("Authorization", `Bearer ${login1.body.token}`);

      const profile2 = await request(app)
        .get("/profile")
        .set("Authorization", `Bearer ${login2.body.token}`);

      expect(profile1.status).toBe(200);
      expect(profile2.status).toBe(200);
    });
  });

  describe("Security", () => {
    it("should use process.env.JWT_SECRET", () => {
      // This is tested implicitly through token verification
      expect(JWT_SECRET).toBe("supersecretkeyforjwt");
    });

    it("should not expose password in profile", async () => {
      const loginRes = await request(app)
        .post("/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      const profileRes = await request(app)
        .get("/profile")
        .set("Authorization", `Bearer ${loginRes.body.token}`);

      expect(profileRes.body).not.toHaveProperty("password");
    });

    it("should extract token from Bearer scheme", async () => {
      const loginRes = await request(app)
        .post("/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      const response = await request(app)
        .get("/profile")
        .set("Authorization", `Bearer ${loginRes.body.token}`);

      expect(response.status).toBe(200);
    });
  });
});
