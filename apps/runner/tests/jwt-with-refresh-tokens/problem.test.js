const request = require("supertest");
const jwt = require("jsonwebtoken");

describe("JWT with Refresh Tokens", () => {
  let app;
  const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || "access-secret-key-for-testing";
  const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh-secret-key-for-testing";

  beforeEach(() => {
    jest.resetModules();
    const userSolution = require("../../index");
    app = userSolution.app || userSolution;
  });

  describe("POST /auth/login - Initial Login", () => {
    it("should return 200 for valid credentials", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
    });

    it("should return both access and refresh tokens", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
      expect(typeof response.body.accessToken).toBe("string");
      expect(typeof response.body.refreshToken).toBe("string");
    });

    it("should return expiresIn field", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(response.body).toHaveProperty("expiresIn");
      expect(typeof response.body.expiresIn).toBe("number");
    });

    it("access token should be valid JWT", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      const accessToken = response.body.accessToken;

      expect(() => {
        jwt.verify(accessToken, ACCESS_SECRET);
      }).not.toThrow();
    });

    it("refresh token should be valid JWT", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      const refreshToken = response.body.refreshToken;

      expect(() => {
        jwt.verify(refreshToken, REFRESH_SECRET);
      }).not.toThrow();
    });

    it("access token should contain user data", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      const decoded = jwt.verify(response.body.accessToken, ACCESS_SECRET);
      expect(decoded).toHaveProperty("id");
      expect(decoded).toHaveProperty("email");
    });

    it("should return 401 for invalid credentials", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "user@example.com",
          password: "wrongpassword",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /auth/profile - Protected Route", () => {
    let accessToken;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post("/auth/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      accessToken = loginResponse.body.accessToken;
    });

    it("should return 200 with valid access token", async () => {
      const response = await request(app)
        .get("/auth/profile")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
    });

    it("should return user profile", async () => {
      const response = await request(app)
        .get("/auth/profile")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("email");
      expect(response.body.email).toBe("user@example.com");
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/auth/profile");
      expect(response.status).toBe(401);
    });

    it("should return 401 with invalid token", async () => {
      const response = await request(app)
        .get("/auth/profile")
        .set("Authorization", "Bearer invalid.token.here");

      expect(response.status).toBe(401);
    });

    it("should return 401 with expired access token", async () => {
      const expiredToken = jwt.sign({ id: "123", email: "user@example.com" }, ACCESS_SECRET, {
        expiresIn: "-1s",
      });

      const response = await request(app)
        .get("/auth/profile")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe("POST /auth/refresh - Token Refresh", () => {
    let refreshToken;
    let accessToken;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post("/auth/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      refreshToken = loginResponse.body.refreshToken;
      accessToken = loginResponse.body.accessToken;
    });

    it("should return 200 with valid refresh token", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
    });

    it("should return new access token", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken })
        .set("Content-Type", "application/json");

      expect(response.body).toHaveProperty("accessToken");
      expect(typeof response.body.accessToken).toBe("string");
      expect(response.body.accessToken).not.toBe(accessToken);
    });

    it("new access token should be valid", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken })
        .set("Content-Type", "application/json");

      const newAccessToken = response.body.accessToken;

      expect(() => {
        jwt.verify(newAccessToken, ACCESS_SECRET);
      }).not.toThrow();
    });

    it("should work with new access token", async () => {
      const refreshResponse = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken })
        .set("Content-Type", "application/json");

      const newAccessToken = refreshResponse.body.accessToken;

      const profileResponse = await request(app)
        .get("/auth/profile")
        .set("Authorization", `Bearer ${newAccessToken}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.email).toBe("user@example.com");
    });

    it("should return 401 for invalid refresh token", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: "invalid.token.here" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(401);
    });

    it("should return 401 for missing refresh token", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .send({})
        .set("Content-Type", "application/json");

      expect(response.status).toBe(401);
    });

    it("should return error message for invalid token", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: "invalid" })
        .set("Content-Type", "application/json");

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /auth/logout - Logout", () => {
    let refreshToken;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post("/auth/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      refreshToken = loginResponse.body.refreshToken;
    });

    it("should return 200 for valid logout", async () => {
      const response = await request(app)
        .post("/auth/logout")
        .send({ refreshToken })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
    });

    it("should return success message", async () => {
      const response = await request(app)
        .post("/auth/logout")
        .send({ refreshToken })
        .set("Content-Type", "application/json");

      expect(response.body).toHaveProperty("message");
    });

    it("should invalidate refresh token after logout", async () => {
      await request(app)
        .post("/auth/logout")
        .send({ refreshToken })
        .set("Content-Type", "application/json");

      const refreshResponse = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken })
        .set("Content-Type", "application/json");

      expect(refreshResponse.status).toBe(401);
    });

    it("should handle logout with invalid token gracefully", async () => {
      const response = await request(app)
        .post("/auth/logout")
        .send({ refreshToken: "invalid" })
        .set("Content-Type", "application/json");

      expect([200, 400, 401]).toContain(response.status);
    });
  });

  describe("Token Lifecycle", () => {
    it("complete auth flow: login -> access -> refresh -> logout", async () => {
      const loginRes = await request(app)
        .post("/auth/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(loginRes.status).toBe(200);
      const { accessToken, refreshToken } = loginRes.body;

      const profileRes = await request(app)
        .get("/auth/profile")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(profileRes.status).toBe(200);

      const refreshRes = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken })
        .set("Content-Type", "application/json");

      expect(refreshRes.status).toBe(200);
      const newAccessToken = refreshRes.body.accessToken;

      const profileRes2 = await request(app)
        .get("/auth/profile")
        .set("Authorization", `Bearer ${newAccessToken}`);

      expect(profileRes2.status).toBe(200);

      const logoutRes = await request(app)
        .post("/auth/logout")
        .send({ refreshToken })
        .set("Content-Type", "application/json");

      expect(logoutRes.status).toBe(200);

      const invalidRefreshRes = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken })
        .set("Content-Type", "application/json");

      expect(invalidRefreshRes.status).toBe(401);
    });

    it("should handle multiple refresh token requests", async () => {
      const loginRes = await request(app)
        .post("/auth/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      const refreshToken = loginRes.body.refreshToken;

      const refresh1 = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken })
        .set("Content-Type", "application/json");

      expect(refresh1.status).toBe(200);

      const refresh2 = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken })
        .set("Content-Type", "application/json");

      expect([200, 401]).toContain(refresh2.status);
    });
  });

  describe("Token Expiry", () => {
    it("access token should have shorter expiry than refresh token", async () => {
      const loginRes = await request(app)
        .post("/auth/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      const accessDecoded = jwt.decode(loginRes.body.accessToken);
      const refreshDecoded = jwt.decode(loginRes.body.refreshToken);

      expect(accessDecoded.exp).toBeLessThan(refreshDecoded.exp);
    });

    it("expiresIn should match access token expiry", async () => {
      const loginRes = await request(app)
        .post("/auth/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      const expiresIn = loginRes.body.expiresIn;
      const decoded = jwt.decode(loginRes.body.accessToken);

      const tokenExpiry = decoded.exp - decoded.iat;

      // Should be close (within 60 seconds tolerance)
      expect(Math.abs(tokenExpiry - expiresIn)).toBeLessThan(60);
    });
  });

  describe("Security", () => {
    it("should not expose passwords", async () => {
      const loginRes = await request(app)
        .post("/auth/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      const accessDecoded = jwt.decode(loginRes.body.accessToken);
      expect(accessDecoded).not.toHaveProperty("password");
    });

    it("should use different secrets for access and refresh", async () => {
      const loginRes = await request(app)
        .post("/auth/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      const accessToken = loginRes.body.accessToken;
      const refreshToken = loginRes.body.refreshToken;

      expect(() => {
        jwt.verify(accessToken, REFRESH_SECRET);
      }).toThrow();

      expect(() => {
        jwt.verify(refreshToken, ACCESS_SECRET);
      }).toThrow();
    });

    it("should not allow using refresh token as access token", async () => {
      const loginRes = await request(app)
        .post("/auth/login")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      const refreshToken = loginRes.body.refreshToken;

      const profileRes = await request(app)
        .get("/auth/profile")
        .set("Authorization", `Bearer ${refreshToken}`);

      expect(profileRes.status).toBe(401);
    });
  });
});
