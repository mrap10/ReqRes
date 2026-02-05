const request = require("supertest");

describe("Request Body Parser", () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    const userSolution = require("../../index");
    app = userSolution.app || userSolution;
  });

  describe("POST /users with valid data", () => {
    it("should return 201 status for successful creation", async () => {
      const response = await request(app)
        .post("/users")
        .send({ name: "John Doe", email: "john@example.com" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);
    });

    it("should return the created user with id", async () => {
      const response = await request(app)
        .post("/users")
        .send({ name: "John Doe", email: "john@example.com" })
        .set("Content-Type", "application/json");

      expect(response.body).toHaveProperty("id");
      expect(response.body.id).toBeTruthy();
    });

    it("should return the user with name and email", async () => {
      const response = await request(app)
        .post("/users")
        .send({ name: "John Doe", email: "john@example.com" })
        .set("Content-Type", "application/json");

      expect(response.body.name).toBe("John Doe");
      expect(response.body.email).toBe("john@example.com");
    });

    it("should include createdAt timestamp", async () => {
      const response = await request(app)
        .post("/users")
        .send({ name: "Jane Smith", email: "jane@example.com" })
        .set("Content-Type", "application/json");

      expect(response.body).toHaveProperty("createdAt");

      const createdAt = new Date(response.body.createdAt);
      expect(createdAt).toBeInstanceOf(Date);
      expect(isNaN(createdAt.getTime())).toBe(false);
    });

    it("should handle multiple user creations with unique IDs", async () => {
      const response1 = await request(app)
        .post("/users")
        .send({ name: "User 1", email: "user1@example.com" })
        .set("Content-Type", "application/json");

      const response2 = await request(app)
        .post("/users")
        .send({ name: "User 2", email: "user2@example.com" })
        .set("Content-Type", "application/json");

      expect(response1.body.id).not.toEqual(response2.body.id);
    });
  });

  describe("POST /users with invalid data", () => {
    it("should return 400 when name is missing", async () => {
      const response = await request(app)
        .post("/users")
        .send({ email: "john@example.com" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });

    it("should return 400 when email is missing", async () => {
      const response = await request(app)
        .post("/users")
        .send({ name: "John Doe" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });

    it("should return error message when fields are missing", async () => {
      const response = await request(app)
        .post("/users")
        .send({ name: "John Doe" })
        .set("Content-Type", "application/json");

      expect(response.body).toHaveProperty("error");

      const errorMsg = response.body.error.toLowerCase();
      expect(
        errorMsg.includes("required") || errorMsg.includes("missing") || errorMsg.includes("email")
      ).toBe(true);
    });

    it("should return 400 when body is empty", async () => {
      const response = await request(app)
        .post("/users")
        .send({})
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });

    it("should return 400 when both fields are missing", async () => {
      const response = await request(app)
        .post("/users")
        .send({})
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("JSON parsing", () => {
    it("should accept JSON content type", async () => {
      const response = await request(app)
        .post("/users")
        .send({ name: "Test User", email: "test@example.com" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);
    });

    it("should handle extra fields gracefully", async () => {
      const response = await request(app)
        .post("/users")
        .send({
          name: "John Doe",
          email: "john@example.com",
          age: 30,
          city: "New York",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("John Doe");
      expect(response.body.email).toBe("john@example.com");
    });
  });
});
