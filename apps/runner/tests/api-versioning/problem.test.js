const request = require("supertest");

describe("API Versioning", () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    const userSolution = require("../../index");
    app = userSolution.app || userSolution;
  });

  describe("Version 1 API", () => {
    describe("GET /v1/users", () => {
      it("should return 200 status", async () => {
        const response = await request(app).get("/v1/users");
        expect(response.status).toBe(200);
      });

      it("should return an array of users", async () => {
        const response = await request(app).get("/v1/users");
        expect(Array.isArray(response.body)).toBe(true);
      });

      it("should return users in v1 format", async () => {
        const response = await request(app).get("/v1/users");

        if (response.body.length > 0) {
          const user = response.body[0];
          expect(user).toHaveProperty("id");
          expect(user).toHaveProperty("fullName");
        }
      });

      it("should use fullName field (not firstName/lastName)", async () => {
        const response = await request(app).get("/v1/users");

        if (response.body.length > 0) {
          const user = response.body[0];
          expect(user.fullName).toBeDefined();
          expect(typeof user.fullName).toBe("string");
        }
      });

      it("should not include email in v1", async () => {
        const response = await request(app).get("/v1/users");

        if (response.body.length > 0) {
          const user = response.body[0];
          expect(user.email).toBeUndefined();
        }
      });

      it("should not include firstName/lastName separately", async () => {
        const response = await request(app).get("/v1/users");

        if (response.body.length > 0) {
          const user = response.body[0];
          expect(user.firstName).toBeUndefined();
          expect(user.lastName).toBeUndefined();
        }
      });

      it("should return multiple users", async () => {
        const response = await request(app).get("/v1/users");
        expect(response.body.length).toBeGreaterThanOrEqual(2);
      });
    });

    describe("GET /v1/users/:id", () => {
      it("should return 200 for existing user", async () => {
        const response = await request(app).get("/v1/users/1");
        expect(response.status).toBe(200);
      });

      it("should return single user in v1 format", async () => {
        const response = await request(app).get("/v1/users/1");

        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("fullName");
        expect(response.body.id).toBe(1);
      });

      it("should return fullName as string", async () => {
        const response = await request(app).get("/v1/users/1");

        expect(typeof response.body.fullName).toBe("string");
        expect(response.body.fullName.length).toBeGreaterThan(0);
      });

      it("should handle different user IDs", async () => {
        const response1 = await request(app).get("/v1/users/1");
        const response2 = await request(app).get("/v1/users/2");

        expect(response1.status).toBe(200);
        expect(response2.status).toBe(200);
        expect(response1.body.id).toBe(1);
        expect(response2.body.id).toBe(2);
      });

      it("should return 404 for non-existent user", async () => {
        const response = await request(app).get("/v1/users/999");
        expect(response.status).toBe(404);
      });
    });
  });

  describe("Version 2 API", () => {
    describe("GET /v2/users", () => {
      it("should return 200 status", async () => {
        const response = await request(app).get("/v2/users");
        expect(response.status).toBe(200);
      });

      it("should return an array of users", async () => {
        const response = await request(app).get("/v2/users");
        expect(Array.isArray(response.body)).toBe(true);
      });

      it("should return users in v2 format", async () => {
        const response = await request(app).get("/v2/users");

        if (response.body.length > 0) {
          const user = response.body[0];
          expect(user).toHaveProperty("id");
          expect(user).toHaveProperty("firstName");
          expect(user).toHaveProperty("lastName");
          expect(user).toHaveProperty("email");
        }
      });

      it("should have separate firstName and lastName", async () => {
        const response = await request(app).get("/v2/users");

        if (response.body.length > 0) {
          const user = response.body[0];
          expect(typeof user.firstName).toBe("string");
          expect(typeof user.lastName).toBe("string");
        }
      });

      it("should include email field", async () => {
        const response = await request(app).get("/v2/users");

        if (response.body.length > 0) {
          const user = response.body[0];
          expect(user.email).toBeDefined();
          expect(typeof user.email).toBe("string");
          expect(user.email).toContain("@");
        }
      });

      it("should not include fullName in v2", async () => {
        const response = await request(app).get("/v2/users");

        if (response.body.length > 0) {
          const user = response.body[0];
          expect(user.fullName).toBeUndefined();
        }
      });

      it("should return multiple users", async () => {
        const response = await request(app).get("/v2/users");
        expect(response.body.length).toBeGreaterThanOrEqual(2);
      });
    });

    describe("GET /v2/users/:id", () => {
      it("should return 200 for existing user", async () => {
        const response = await request(app).get("/v2/users/1");
        expect(response.status).toBe(200);
      });

      it("should return single user in v2 format", async () => {
        const response = await request(app).get("/v2/users/1");

        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("firstName");
        expect(response.body).toHaveProperty("lastName");
        expect(response.body).toHaveProperty("email");
        expect(response.body.id).toBe(1);
      });

      it("should have valid email format", async () => {
        const response = await request(app).get("/v2/users/1");

        expect(response.body.email).toContain("@");
        expect(response.body.email).toContain(".");
      });

      it("should handle different user IDs", async () => {
        const response1 = await request(app).get("/v2/users/1");
        const response2 = await request(app).get("/v2/users/2");

        expect(response1.status).toBe(200);
        expect(response2.status).toBe(200);
        expect(response1.body.id).toBe(1);
        expect(response2.body.id).toBe(2);
      });

      it("should return 404 for non-existent user", async () => {
        const response = await request(app).get("/v2/users/999");
        expect(response.status).toBe(404);
      });
    });
  });

  describe("Version comparison", () => {
    it("v1 and v2 should return same user data in different formats", async () => {
      const v1Response = await request(app).get("/v1/users/1");
      const v2Response = await request(app).get("/v2/users/1");

      expect(v1Response.status).toBe(200);
      expect(v2Response.status).toBe(200);

      // Same user ID
      expect(v1Response.body.id).toBe(v2Response.body.id);

      // v1 has fullName
      expect(v1Response.body.fullName).toBeDefined();

      // v2 has firstName, lastName, email
      expect(v2Response.body.firstName).toBeDefined();
      expect(v2Response.body.lastName).toBeDefined();
      expect(v2Response.body.email).toBeDefined();
    });

    it("v1 fullName should combine v2 firstName and lastName", async () => {
      const v1Response = await request(app).get("/v1/users/1");
      const v2Response = await request(app).get("/v2/users/1");

      const fullName = v1Response.body.fullName;
      const firstName = v2Response.body.firstName;
      const lastName = v2Response.body.lastName;

      expect(fullName).toContain(firstName);
      expect(fullName).toContain(lastName);
    });

    it("should have same number of users in both versions", async () => {
      const v1Response = await request(app).get("/v1/users");
      const v2Response = await request(app).get("/v2/users");

      expect(v1Response.body.length).toBe(v2Response.body.length);
    });
  });

  describe("Shared data layer", () => {
    it("both versions should access the same underlying data", async () => {
      const v1Users = await request(app).get("/v1/users");
      const v2Users = await request(app).get("/v2/users");

      const v1Ids = v1Users.body.map((u) => u.id).sort();
      const v2Ids = v2Users.body.map((u) => u.id).sort();

      expect(v1Ids).toEqual(v2Ids);
    });

    it("should handle at least 2 users in data", async () => {
      const response = await request(app).get("/v1/users");
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Route isolation", () => {
    it("v1 routes should not affect v2 routes", async () => {
      await request(app).get("/v1/users/1");

      const v2Response = await request(app).get("/v2/users/1");
      expect(v2Response.status).toBe(200);
    });

    it("should handle concurrent requests to different versions", async () => {
      const [v1Response, v2Response] = await Promise.all([
        request(app).get("/v1/users"),
        request(app).get("/v2/users"),
      ]);

      expect(v1Response.status).toBe(200);
      expect(v2Response.status).toBe(200);
      expect(v1Response.body[0]).toHaveProperty("fullName");
      expect(v2Response.body[0]).toHaveProperty("firstName");
    });
  });

  describe("Error handling", () => {
    it("v1 should return 404 for invalid user", async () => {
      const response = await request(app).get("/v1/users/invalid");
      expect([404, 400]).toContain(response.status);
    });

    it("v2 should return 404 for invalid user", async () => {
      const response = await request(app).get("/v2/users/invalid");
      expect([404, 400]).toContain(response.status);
    });

    it("should return JSON errors", async () => {
      const response = await request(app).get("/v1/users/999");
      expect(response.headers["content-type"]).toMatch(/json/);
    });
  });

  describe("Express Router usage", () => {
    it("should properly namespace v1 routes", async () => {
      const response = await request(app).get("/v1/users");
      expect(response.status).toBe(200);
    });

    it("should properly namespace v2 routes", async () => {
      const response = await request(app).get("/v2/users");
      expect(response.status).toBe(200);
    });

    it("should not have users endpoint at root", async () => {
      const response = await request(app).get("/users");
      expect(response.status).toBe(404);
    });
  });
});
