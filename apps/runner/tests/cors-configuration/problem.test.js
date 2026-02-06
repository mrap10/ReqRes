const request = require("supertest");

describe("CORS Configuration", () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    const userSolution = require("../../index");
    app = userSolution.app || userSolution;
  });

  const allowedOrigins = [
    "http://localhost:3000",
    "https://reqres.online",
    "https://reqres.online",
  ];

  const blockedOrigin = "https://reqres.online";

  describe("OPTIONS preflight requests", () => {
    it("should handle OPTIONS requests", async () => {
      const response = await request(app).options("/api/public").set("Origin", allowedOrigins[0]);

      expect([200, 204]).toContain(response.status);
    });

    it("should set Access-Control-Allow-Origin for allowed origin", async () => {
      const response = await request(app).options("/api/public").set("Origin", allowedOrigins[0]);

      expect(response.headers["access-control-allow-origin"]).toBeDefined();
    });

    it("should set Access-Control-Allow-Methods", async () => {
      const response = await request(app).options("/api/public").set("Origin", allowedOrigins[0]);

      expect(response.headers["access-control-allow-methods"]).toBeDefined();

      const methods = response.headers["access-control-allow-methods"];
      expect(methods).toContain("GET");
      expect(methods).toContain("POST");
    });

    it("should set Access-Control-Allow-Headers", async () => {
      const response = await request(app).options("/api/public").set("Origin", allowedOrigins[0]);

      expect(response.headers["access-control-allow-headers"]).toBeDefined();
    });

    it("should allow Content-Type header", async () => {
      const response = await request(app).options("/api/public").set("Origin", allowedOrigins[0]);

      const allowedHeaders = response.headers["access-control-allow-headers"].toLowerCase();
      expect(allowedHeaders).toContain("content-type");
    });

    it("should allow Authorization header", async () => {
      const response = await request(app).options("/api/public").set("Origin", allowedOrigins[0]);

      const allowedHeaders = response.headers["access-control-allow-headers"].toLowerCase();
      expect(allowedHeaders).toContain("authorization");
    });
  });

  describe("GET /api/public - Allowed origins", () => {
    it("should allow request from localhost:3000", async () => {
      const response = await request(app).get("/api/public").set("Origin", "http://localhost:3000");

      expect(response.status).toBe(200);
    });

    it("should set CORS headers for localhost:3000", async () => {
      const response = await request(app).get("/api/public").set("Origin", "http://localhost:3000");

      expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
    });

    it("should allow request from https://myapp.com", async () => {
      const response = await request(app).get("/api/public").set("Origin", "https://myapp.com");

      expect(response.status).toBe(200);
    });

    it("should set CORS headers for https://myapp.com", async () => {
      const response = await request(app).get("/api/public").set("Origin", "https://myapp.com");

      expect(response.headers["access-control-allow-origin"]).toBe("https://myapp.com");
    });

    it("should allow request from https://www.myapp.com", async () => {
      const response = await request(app).get("/api/public").set("Origin", "https://www.myapp.com");

      expect(response.status).toBe(200);
    });

    it("should return public data for allowed origins", async () => {
      const response = await request(app).get("/api/public").set("Origin", allowedOrigins[0]);

      expect(response.body).toHaveProperty("message");
    });

    it("should set Access-Control-Allow-Credentials", async () => {
      const response = await request(app).get("/api/public").set("Origin", allowedOrigins[0]);

      expect(response.headers["access-control-allow-credentials"]).toBe("true");
    });
  });

  describe("GET /api/public - Blocked origins", () => {
    it("should block request from unauthorized origin", async () => {
      const response = await request(app).get("/api/public").set("Origin", blockedOrigin);

      expect(response.status).toBe(403);
    });

    it("should return error message for blocked origin", async () => {
      const response = await request(app).get("/api/public").set("Origin", blockedOrigin);

      expect(response.body).toHaveProperty("error");

      const error = response.body.error.toLowerCase();
      expect(
        error.includes("cors") || error.includes("origin") || error.includes("not allowed")
      ).toBe(true);
    });

    it("should not set CORS headers for blocked origin", async () => {
      const response = await request(app).get("/api/public").set("Origin", blockedOrigin);

      const allowOrigin = response.headers["access-control-allow-origin"];
      expect(allowOrigin).not.toBe(blockedOrigin);
    });

    it("should block random origins", async () => {
      const randomOrigin = "https://random-domain.com";

      const response = await request(app).get("/api/public").set("Origin", randomOrigin);

      expect(response.status).toBe(403);
    });
  });

  describe("POST /api/data - CORS with POST requests", () => {
    it("should allow POST from allowed origin", async () => {
      const response = await request(app)
        .post("/api/data")
        .set("Origin", allowedOrigins[0])
        .send({ test: "data" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
    });

    it("should return success for valid POST", async () => {
      const response = await request(app)
        .post("/api/data")
        .set("Origin", allowedOrigins[0])
        .send({ test: "data" })
        .set("Content-Type", "application/json");

      expect(response.body).toHaveProperty("message");
    });

    it("should echo posted data", async () => {
      const testData = { name: "test", value: 123 };

      const response = await request(app)
        .post("/api/data")
        .set("Origin", allowedOrigins[0])
        .send(testData)
        .set("Content-Type", "application/json");

      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toEqual(testData);
    });

    it("should block POST from unauthorized origin", async () => {
      const response = await request(app)
        .post("/api/data")
        .set("Origin", blockedOrigin)
        .send({ test: "data" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(403);
    });

    it("should set CORS headers on POST response", async () => {
      const response = await request(app)
        .post("/api/data")
        .set("Origin", allowedOrigins[0])
        .send({ test: "data" })
        .set("Content-Type", "application/json");

      expect(response.headers["access-control-allow-origin"]).toBe(allowedOrigins[0]);
    });
  });

  describe("Origin validation", () => {
    it("should be case-sensitive for origin matching", async () => {
      const response = await request(app).get("/api/public").set("Origin", "HTTP://LOCALHOST:3000");

      // Might accept or reject depending on implementation
      // Most implementations are case-sensitive
      expect([200, 403]).toContain(response.status);
    });

    it("should not allow subdomain of allowed origin", async () => {
      const response = await request(app)
        .get("/api/public")
        .set("Origin", "https://api.reqres.online");

      expect(response.status).toBe(403);
    });

    it("should handle missing Origin header gracefully", async () => {
      const response = await request(app).get("/api/public");

      expect([200, 403, 400]).toContain(response.status);
    });
  });

  describe("CORS middleware implementation", () => {
    it("should apply CORS to all /api routes", async () => {
      const response = await request(app).get("/api/public").set("Origin", allowedOrigins[0]);

      expect(response.headers["access-control-allow-origin"]).toBeDefined();
    });

    it("should check origin before processing request", async () => {
      const response = await request(app)
        .post("/api/data")
        .set("Origin", blockedOrigin)
        .send({ test: "data" })
        .set("Content-Type", "application/json");

      // Should be blocked before reaching route handler
      expect(response.status).toBe(403);
    });
  });

  describe("Security headers", () => {
    it("should not allow wildcard origin", async () => {
      const response = await request(app).get("/api/public").set("Origin", allowedOrigins[0]);

      expect(response.headers["access-control-allow-origin"]).not.toBe("*");
    });

    it("should only allow specific whitelisted origins", async () => {
      const response = await request(app).get("/api/public").set("Origin", allowedOrigins[0]);

      const allowedOrigin = response.headers["access-control-allow-origin"];
      expect(allowedOrigins).toContain(allowedOrigin);
    });

    it("should allow credentials", async () => {
      const response = await request(app).get("/api/public").set("Origin", allowedOrigins[0]);

      expect(response.headers["access-control-allow-credentials"]).toBe("true");
    });
  });

  describe("Route functionality", () => {
    it("/api/public should return public message", async () => {
      const response = await request(app).get("/api/public").set("Origin", allowedOrigins[0]);

      expect(response.body.message).toBeDefined();
      expect(typeof response.body.message).toBe("string");
    });

    it("/api/data should accept and return data", async () => {
      const testData = { key: "value" };

      const response = await request(app)
        .post("/api/data")
        .set("Origin", allowedOrigins[0])
        .send(testData)
        .set("Content-Type", "application/json");

      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("data");
    });
  });
});
