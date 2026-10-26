const { test, before, after } = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

// Tests insert fake data: refuse to run against anything but a local test database
if (!/localhost|127\.0\.0\.1/.test(process.env.MONGODB_URI || "")) {
  throw new Error("Set MONGODB_URI to a local test database, e.g. MONGODB_URI=mongodb://localhost:27017 npm test");
}

const { app, ready, client } = require("../index");

before(async () => {
  await ready; // wait until DB is connected and routes are registered
});

after(async () => {
  await client.close(); // let the test process exit
});

test("GET /health returns ok", async () => {
  const res = await request(app).get("/health");
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { status: "ok" });
});

test("POST /medicine adds a medicine and GET /medicine returns it", async () => {
  const name = "TestMed-" + Date.now();

  const post = await request(app).post("/medicine").send({ name, price: 10 });
  assert.strictEqual(post.status, 201);

  const get = await request(app).get("/medicine");
  assert.strictEqual(get.status, 200);
  assert.ok(get.body.some((m) => m.name === name));
});

test("POST /customer responds once with 201", async () => {
  const res = await request(app).post("/customer").send({ email: "t" + Date.now() + "@test.com" });
  assert.strictEqual(res.status, 201);
  assert.ok(res.body.insertedId);
});

test("POST /user never stores or returns a password", async () => {
  const email = "pw" + Date.now() + "@test.com";
  await request(app).post("/user").send({ email, password: "secret123" });

  const res = await request(app).get("/user");
  const saved = res.body.find((u) => u.email === email);
  assert.ok(saved);
  assert.strictEqual(saved.password, undefined);
});