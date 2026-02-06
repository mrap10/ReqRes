const request = require("supertest");

describe("GraphQL-like Query API", () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    const userSolution = require("../../index");
    app = userSolution.app || userSolution;
  });

  describe("GET /api/users - All fields", () => {
    it("should return 200", async () => {
      const response = await request(app).get("/api/users");
      expect(response.status).toBe(200);
    });

    it("should return array of users", async () => {
      const response = await request(app).get("/api/users");
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should return all fields when no fields param", async () => {
      const response = await request(app).get("/api/users");
      const user = response.body[0];

      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("age");
      expect(user).toHaveProperty("verified");
    });
  });

  describe("Field Selection", () => {
    it("should return only selected fields", async () => {
      const response = await request(app).get("/api/users?fields=id,name");
      const user = response.body[0];

      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("name");
      expect(user).not.toHaveProperty("email");
      expect(user).not.toHaveProperty("age");
    });

    it("should handle single field selection", async () => {
      const response = await request(app).get("/api/users?fields=name");
      const user = response.body[0];

      expect(user).toHaveProperty("name");
      expect(user).not.toHaveProperty("email");
    });

    it("should handle multiple field selection", async () => {
      const response = await request(app).get("/api/users?fields=id,name,email");
      const user = response.body[0];

      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("email");
      expect(user).not.toHaveProperty("age");
      expect(user).not.toHaveProperty("verified");
    });

    it("should handle field selection with spaces", async () => {
      const response = await request(app).get("/api/users?fields=id, name, email");
      const user = response.body[0];

      // Should work with or without spaces
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("name");
    });

    it("should ignore invalid field names", async () => {
      const response = await request(app).get("/api/users?fields=id,name,invalidField");
      const user = response.body[0];

      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("name");
      expect(user).not.toHaveProperty("invalidField");
    });

    it("all users should have same fields selected", async () => {
      const response = await request(app).get("/api/users?fields=id,name");

      response.body.forEach((user) => {
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("name");
        expect(user).not.toHaveProperty("email");
      });
    });
  });

  describe("Filtering", () => {
    it("should filter by verified status", async () => {
      const response = await request(app).get("/api/users?filter=verified:true");

      expect(Array.isArray(response.body)).toBe(true);

      response.body.forEach((user) => {
        expect(user.verified).toBe(true);
      });
    });

    it("should filter by verified:false", async () => {
      const response = await request(app).get("/api/users?filter=verified:false");

      response.body.forEach((user) => {
        expect(user.verified).toBe(false);
      });
    });

    it("should filter by exact name match", async () => {
      const response = await request(app).get("/api/users?filter=name:John Doe");

      if (response.body.length > 0) {
        response.body.forEach((user) => {
          expect(user.name).toContain("John");
        });
      }
    });

    it("should filter by age greater than", async () => {
      const response = await request(app).get("/api/users?filter=age>25");

      if (response.body.length > 0) {
        response.body.forEach((user) => {
          expect(user.age).toBeGreaterThan(25);
        });
      }
    });

    it("should filter by age less than", async () => {
      const response = await request(app).get("/api/users?filter=age<40");

      response.body.forEach((user) => {
        expect(user.age).toBeLessThan(40);
      });
    });

    it("should return empty array when no matches", async () => {
      const response = await request(app).get("/api/users?filter=age>999");
      expect(response.body).toEqual([]);
    });

    it("should combine filtering with field selection", async () => {
      const response = await request(app).get("/api/users?fields=id,name&filter=verified:true");

      if (response.body.length > 0) {
        const user = response.body[0];
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("name");
        expect(user).not.toHaveProperty("email");
      }
    });
  });

  describe("Nested Field Selection", () => {
    it("should select nested post fields", async () => {
      const response = await request(app).get("/api/users?fields=id,name,posts.title");
      const user = response.body[0];

      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("posts");

      if (user.posts && user.posts.length > 0) {
        const post = user.posts[0];
        expect(post).toHaveProperty("title");
        expect(post).not.toHaveProperty("id");
      }
    });

    it("should select multiple nested fields", async () => {
      const response = await request(app).get("/api/users?fields=id,posts.title,posts.date");
      const user = response.body[0];

      if (user.posts && user.posts.length > 0) {
        const post = user.posts[0];
        expect(post).toHaveProperty("title");
        expect(post).toHaveProperty("date");
      }
    });

    it("should handle users without posts", async () => {
      const response = await request(app).get("/api/users?fields=id,name,posts.title");

      // Should work for all users, even those without posts
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /api/users/:id - Single User", () => {
    it("should return single user", async () => {
      const response = await request(app).get("/api/users/1");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body.id).toBe(1);
    });

    it("should support field selection for single user", async () => {
      const response = await request(app).get("/api/users/1?fields=id,name");

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("name");
      expect(response.body).not.toHaveProperty("email");
    });

    it("should support nested fields for single user", async () => {
      const response = await request(app).get("/api/users/1?fields=name,posts.title");

      expect(response.body).toHaveProperty("name");
      expect(response.body).toHaveProperty("posts");
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app).get("/api/users/999");
      expect(response.status).toBe(404);
    });

    it("should return 404 for invalid user id", async () => {
      const response = await request(app).get("/api/users/invalid");
      expect([404, 400]).toContain(response.status);
    });
  });

  describe("Query Parsing", () => {
    it("should handle URL-encoded field names", async () => {
      const response = await request(app).get("/api/users?fields=id%2Cname");
      const user = response.body[0];

      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("name");
    });

    it("should handle empty fields parameter", async () => {
      const response = await request(app).get("/api/users?fields=");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should handle empty filter parameter", async () => {
      const response = await request(app).get("/api/users?filter=");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should be case-sensitive for field names", async () => {
      const response = await request(app).get("/api/users?fields=ID,NAME");
      const user = response.body[0];

      // Field names should be case-sensitive (lowercase expected)
      expect(user).not.toHaveProperty("ID");
      expect(user).not.toHaveProperty("NAME");
    });
  });

  describe("Data Integrity", () => {
    it("should not modify original data", async () => {
      const response1 = await request(app).get("/api/users?fields=id,name");
      const response2 = await request(app).get("/api/users");

      const user1 = response1.body[0];
      const user2 = response2.body[0];

      expect(user1).not.toHaveProperty("email");
      expect(user2).toHaveProperty("email");
    });

    it("should have consistent data structure", async () => {
      const response = await request(app).get("/api/users");

      const fields = Object.keys(response.body[0]);

      response.body.forEach((user) => {
        const userFields = Object.keys(user);
        expect(userFields.sort()).toEqual(fields.sort());
      });
    });
  });

  describe("Performance", () => {
    it("should return results for large field selections", async () => {
      const response = await request(app).get("/api/users?fields=id,name,email,age,verified");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should handle multiple filters", async () => {
      const response = await request(app).get("/api/users?filter=verified:true");

      expect(response.status).toBe(200);
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed filter syntax gracefully", async () => {
      const response = await request(app).get("/api/users?filter=invalid");

      expect([200, 400]).toContain(response.status);
    });

    it("should return valid JSON for all responses", async () => {
      const response = await request(app).get("/api/users?fields=id");

      expect(() => JSON.stringify(response.body)).not.toThrow();
    });
  });
});
