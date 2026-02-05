const request = require("supertest");

describe("Input Validation Middleware", () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    const userSolution = require("../../index");
    app = userSolution.app || userSolution;
  });

  describe("POST /register - Valid data", () => {
    it("should accept valid registration data", async () => {
      const response = await request(app)
        .post("/register")
        .send({
          email: "user@example.com",
          password: "password123",
          name: "John Doe",
        })
        .set("Content-Type", "application/json");

      expect([200, 201]).toContain(response.status);
    });

    it("should return user data for valid input", async () => {
      const response = await request(app)
        .post("/register")
        .send({
          email: "test@example.com",
          password: "securepass123",
          name: "Test User",
        })
        .set("Content-Type", "application/json");

      expect(response.body).toHaveProperty("email");
      expect(response.body.email).toBe("test@example.com");
    });

    it("should accept name with 2 characters", async () => {
      const response = await request(app)
        .post("/register")
        .send({
          email: "user@example.com",
          password: "password123",
          name: "Jo",
        })
        .set("Content-Type", "application/json");

      expect([200, 201]).toContain(response.status);
    });

    it("should accept name with 50 characters", async () => {
      const longName = "A".repeat(50);
      const response = await request(app)
        .post("/register")
        .send({
          email: "user@example.com",
          password: "password123",
          name: longName,
        })
        .set("Content-Type", "application/json");

      expect([200, 201]).toContain(response.status);
    });

    it("should accept password with exactly 8 characters", async () => {
      const response = await request(app)
        .post("/register")
        .send({
          email: "user@example.com",
          password: "12345678",
          name: "John Doe",
        })
        .set("Content-Type", "application/json");

      expect([200, 201]).toContain(response.status);
    });
  });

  describe("POST /register - Invalid email", () => {
    it("should reject invalid email format", async () => {
      const response = await request(app)
        .post("/register")
        .send({
          email: "invalid-email",
          password: "password123",
          name: "John Doe",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });

    it("should return error for invalid email", async () => {
      const response = await request(app)
        .post("/register")
        .send({
          email: "not-an-email",
          password: "password123",
          name: "John Doe",
        })
        .set("Content-Type", "application/json");

      expect(response.body).toHaveProperty("errors");
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it("should mention email in error message", async () => {
      const response = await request(app)
        .post("/register")
        .send({
          email: "invalid",
          password: "password123",
          name: "John Doe",
        })
        .set("Content-Type", "application/json");

      const errors = response.body.errors;
      const emailError = errors.find(
        (e) => e.field === "email" || e.message.toLowerCase().includes("email")
      );

      expect(emailError).toBeDefined();
    });

    it("should reject email without @", async () => {
      const response = await request(app)
        .post("/register")
        .send({
          email: "useremail.com",
          password: "password123",
          name: "John Doe",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });

    it("should reject email without domain", async () => {
      const response = await request(app)
        .post("/register")
        .send({
          email: "user@",
          password: "password123",
          name: "John Doe",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });
  });

  describe("POST /register - Invalid password", () => {
    it("should reject password less than 8 characters", async () => {
      const response = await request(app)
        .post("/register")
        .send({
          email: "user@example.com",
          password: "short",
          name: "John Doe",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });

    it("should return error for short password", async () => {
      const response = await request(app)
        .post("/register")
        .send({
          email: "user@example.com",
          password: "pass",
          name: "John Doe",
        })
        .set("Content-Type", "application/json");

      const errors = response.body.errors;
      const passwordError = errors.find(
        (e) => e.field === "password" || e.message.toLowerCase().includes("password")
      );

      expect(passwordError).toBeDefined();
    });

    it("should mention 8 characters in password error", async () => {
      const response = await request(app)
        .post("/register")
        .send({
          email: "user@example.com",
          password: "1234567",
          name: "John Doe",
        })
        .set("Content-Type", "application/json");

      const errors = response.body.errors;
      const passwordError = errors.find(
        (e) => e.field === "password" || e.message.toLowerCase().includes("password")
      );

      expect(passwordError.message).toContain("8");
    });
  });

  describe("POST /register - Invalid name", () => {
    it("should reject name with 1 character", async () => {
      const response = await request(app)
        .post("/register")
        .send({
          email: "user@example.com",
          password: "password123",
          name: "J",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });

    it("should reject name longer than 50 characters", async () => {
      const longName = "A".repeat(51);
      const response = await request(app)
        .post("/register")
        .send({
          email: "user@example.com",
          password: "password123",
          name: longName,
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });

    it("should return error for invalid name", async () => {
      const response = await request(app)
        .post("/register")
        .send({
          email: "user@example.com",
          password: "password123",
          name: "X",
        })
        .set("Content-Type", "application/json");

      const errors = response.body.errors;
      const nameError = errors.find(
        (e) => e.field === "name" || e.message.toLowerCase().includes("name")
      );

      expect(nameError).toBeDefined();
    });
  });

  describe("POST /register - Missing fields", () => {
    it("should reject missing email", async () => {
      const response = await request(app)
        .post("/register")
        .send({
          password: "password123",
          name: "John Doe",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });

    it("should reject missing password", async () => {
      const response = await request(app)
        .post("/register")
        .send({
          email: "user@example.com",
          name: "John Doe",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });

    it("should reject missing name", async () => {
      const response = await request(app)
        .post("/register")
        .send({
          email: "user@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });
  });

  describe("POST /register - Multiple errors", () => {
    it("should return all validation errors", async () => {
      const response = await request(app)
        .post("/register")
        .send({
          email: "invalid-email",
          password: "short",
          name: "J",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      expect(response.body.errors.length).toBeGreaterThanOrEqual(2);
    });

    it("should include field names in errors", async () => {
      const response = await request(app)
        .post("/register")
        .send({
          email: "bad",
          password: "bad",
          name: "J",
        })
        .set("Content-Type", "application/json");

      const errors = response.body.errors;
      errors.forEach((error) => {
        expect(error).toHaveProperty("field");
        expect(error).toHaveProperty("message");
      });
    });
  });

  describe("GET /search - Query validation", () => {
    it("should accept valid search query", async () => {
      const response = await request(app).get("/search?query=express&limit=10");
      expect(response.status).toBe(200);
    });

    it("should return search results", async () => {
      const response = await request(app).get("/search?query=test&limit=5");

      expect(response.body).toHaveProperty("results");
      expect(Array.isArray(response.body.results)).toBe(true);
    });

    it("should reject query less than 3 characters", async () => {
      const response = await request(app).get("/search?query=ab");
      expect(response.status).toBe(400);
    });

    it("should return error for short query", async () => {
      const response = await request(app).get("/search?query=xy");

      expect(response.body).toHaveProperty("errors");
      const errors = response.body.errors;
      const queryError = errors.find(
        (e) => e.field === "query" || e.message.toLowerCase().includes("query")
      );

      expect(queryError).toBeDefined();
    });

    it("should accept query without limit (optional)", async () => {
      const response = await request(app).get("/search?query=express");
      expect([200, 400]).toContain(response.status);
    });

    it("should accept valid limit", async () => {
      const response = await request(app).get("/search?query=test&limit=50");
      expect(response.status).toBe(200);
    });

    it("should reject limit over 100", async () => {
      const response = await request(app).get("/search?query=test&limit=150");
      expect(response.status).toBe(400);
    });

    it("should handle non-numeric limit", async () => {
      const response = await request(app).get("/search?query=test&limit=abc");
      expect(response.status).toBe(400);
    });
  });

  describe("Error response format", () => {
    it("should return errors as array", async () => {
      const response = await request(app)
        .post("/register")
        .send({
          email: "invalid",
          password: "bad",
          name: "X",
        })
        .set("Content-Type", "application/json");

      expect(response.body).toHaveProperty("errors");
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it("each error should have field and message", async () => {
      const response = await request(app)
        .post("/register")
        .send({})
        .set("Content-Type", "application/json");

      const errors = response.body.errors;
      expect(errors.length).toBeGreaterThan(0);

      errors.forEach((error) => {
        expect(error).toHaveProperty("field");
        expect(error).toHaveProperty("message");
        expect(typeof error.field).toBe("string");
        expect(typeof error.message).toBe("string");
      });
    });
  });
});
