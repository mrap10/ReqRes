const request = require("supertest");

let app;

beforeAll(() => {
  app = require("../../app").app;
});

describe("CRUD In-Memory Store", () => {
  let createdItemId;

  it("creates an item", async () => {
    const res = await request(app)
      .post("/items")
      .send({ name: "Test Item", value: 42 })
      .expect(201);
    expect(res.body).toEqual({
      id: expect.any(String),
      name: "Test Item",
      value: 42,
    });
    createdItemId = res.body.id;
  });

  it("lists items", async () => {
    const res = await request(app).get("/items").expect(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        {
          id: createdItemId,
          name: "Test Item",
          value: 42,
        },
      ])
    );
  });

  it("reads the created item", async () => {
    const res = await request(app).get(`/items/${createdItemId}`).expect(200);
    expect(res.body).toEqual({
      id: createdItemId,
      name: "Test Item",
      value: 42,
    });
  });

  it("updates the created item", async () => {
    const res = await request(app)
      .put(`/items/${createdItemId}`)
      .send({ name: "Updated Item", value: 84 })
      .expect(200);
    expect(res.body).toEqual({
      id: createdItemId,
      name: "Updated Item",
      value: 84,
    });
  });

  it("deletes the created item", async () => {
    await request(app).delete(`/items/${createdItemId}`).expect(204);
    await request(app).get(`/items/${createdItemId}`).expect(404);
  });

  it("returns 404 for non-existent item", async () => {
    await request(app).get("/items/non-existent-id").expect(404);
  });

  it("returns 404 when updating non-existent item", async () => {
    await request(app).put("/items/non-existent-id").send({ name: "Test", value: 1 }).expect(404);
  });

  it("returns 404 when deleting non-existent item", async () => {
    await request(app).delete("/items/non-existent-id").expect(404);
  });
});
