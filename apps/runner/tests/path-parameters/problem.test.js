const request = require("supertest");

describe("Path Parameters", () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    const userSolution = require("../../index");
    app = userSolution.app || userSolution;
  });

  describe("GET /users/:id", () => {
    it("should return 200 status", async () => {
      const response = await request(app).get("/users/123");
      expect(response.status).toBe(200);
    });

    it("should return JSON response", async () => {
      const response = await request(app).get("/users/123");
      expect(response.headers["content-type"]).toMatch(/json/);
    });

    it("should return the id from path parameter", async () => {
      const response = await request(app).get("/users/123");

      expect(response.body).toHaveProperty("id");
      expect(response.body.id).toBe("123");
    });

    it("should include a message property", async () => {
      const response = await request(app).get("/users/456");

      expect(response.body).toHaveProperty("message");
      expect(typeof response.body.message).toBe("string");
    });

    it("should include the id in the message", async () => {
      const response = await request(app).get("/users/789");

      expect(response.body.message).toContain("789");
    });

    it("should handle different user IDs", async () => {
      const response1 = await request(app).get("/users/100");
      const response2 = await request(app).get("/users/200");

      expect(response1.body.id).toBe("100");
      expect(response2.body.id).toBe("200");
      expect(response1.body.message).toContain("100");
      expect(response2.body.message).toContain("200");
    });

    it("should work with alphanumeric IDs", async () => {
      const response = await request(app).get("/users/abc123");

      expect(response.status).toBe(200);
      expect(response.body.id).toBe("abc123");
    });
  });

  describe("GET /posts/:postId/comments/:commentId", () => {
    it("should return 200 status", async () => {
      const response = await request(app).get("/posts/10/comments/5");
      expect(response.status).toBe(200);
    });

    it("should return both postId and commentId", async () => {
      const response = await request(app).get("/posts/10/comments/5");

      expect(response.body).toHaveProperty("postId");
      expect(response.body).toHaveProperty("commentId");
      expect(response.body.postId).toBe("10");
      expect(response.body.commentId).toBe("5");
    });

    it("should include a message with both IDs", async () => {
      const response = await request(app).get("/posts/10/comments/5");

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("10");
      expect(response.body.message).toContain("5");
    });

    it("should handle different post and comment IDs", async () => {
      const response1 = await request(app).get("/posts/1/comments/2");
      const response2 = await request(app).get("/posts/99/comments/88");

      expect(response1.body.postId).toBe("1");
      expect(response1.body.commentId).toBe("2");
      expect(response2.body.postId).toBe("99");
      expect(response2.body.commentId).toBe("88");
    });

    it("should work with larger numbers", async () => {
      const response = await request(app).get("/posts/12345/comments/67890");

      expect(response.status).toBe(200);
      expect(response.body.postId).toBe("12345");
      expect(response.body.commentId).toBe("67890");
    });

    it("should maintain correct parameter order", async () => {
      const response = await request(app).get("/posts/A/comments/B");

      // PostId should be "A" and commentId should be "B", not reversed
      expect(response.body.postId).toBe("A");
      expect(response.body.commentId).toBe("B");
    });
  });

  describe("Parameter extraction", () => {
    it("should extract parameters correctly from URL", async () => {
      const testCases = [
        { url: "/users/user-1", expectedId: "user-1" },
        { url: "/users/999", expectedId: "999" },
        { url: "/users/test_123", expectedId: "test_123" },
      ];

      for (const testCase of testCases) {
        const response = await request(app).get(testCase.url);
        expect(response.body.id).toBe(testCase.expectedId);
      }
    });

    it("should handle special characters in path params", async () => {
      const response = await request(app).get("/users/user-123");
      expect(response.status).toBe(200);
    });
  });
});
