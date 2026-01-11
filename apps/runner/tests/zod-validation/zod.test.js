const request = require("supertest");

let app;

beforeAll(() => {
  app = require("../../app").app;
});

describe("Zod Validation Middleware", () => {
  it("rejects missing body", async () => {
    await request(app)
      .post("/users")
      .send({})
      .expect(400)
      .expect({ error: "Invalid request body" });
  });

  it("rejects invalid email", async () => {
    await request(app)
      .post("/users")
      .send({ email: "not-an-email", password: "validPassword123" })
      .expect(400)
      .expect({ error: "Invalid request body" });
  });

  it("rejects short password", async () => {
    await request(app)
      .post("/users")
      .send({ email: "test@reqres.site", password: "short", age: 18 })
      .expect(400)
      .expect({ error: "Invalid request body" });
  });

  it("rejects age below 18", async () => {
    await request(app)
      .post("/users")
      .send({ email: "test@reqres.site", password: "validPassword123", age: 17 })
      .expect(400)
      .expect({ error: "Invalid request body" });
  });

  it("accepts valid body", async () => {
    const res = await request(app)
      .post("/users")
      .send({ email: "test@reqres.site", password: "validPassword123", age: 18 })
      .expect(201);

    expect(res.body).toEqual({
      id: expect.any(String),
      email: "test@reqres.site",
      age: 18,
    });
  });

  it("does not return password in response", async () => {
    const res = await request(app)
      .post("/users")
      .send({ email: "secure@reqres.site", password: "securePassword456", age: 25 })
      .expect(201);

    expect(res.body).not.toHaveProperty("password");
  });

  it("rejects missing email", async () => {
    await request(app)
      .post("/users")
      .send({ password: "validPassword123", age: 18 })
      .expect(400)
      .expect({ error: "Invalid request body" });
  });

  it("rejects missing password", async () => {
    await request(app)
      .post("/users")
      .send({ email: "test@reqres.site", age: 18 })
      .expect(400)
      .expect({ error: "Invalid request body" });
  });

  it("accepts age exactly 18", async () => {
    const res = await request(app)
      .post("/users")
      .send({ email: "exact@reqres.site", password: "validPassword123", age: 18 })
      .expect(201);

    expect(res.body.age).toBe(18);
  });

  it("accepts age above 18", async () => {
    const res = await request(app)
      .post("/users")
      .send({ email: "older@reqres.site", password: "validPassword123", age: 30 })
      .expect(201);

    expect(res.body.age).toBe(30);
  });
});
