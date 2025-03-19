/* eslint-disable no-undef */
const request = require("supertest");
const app = require("./server"); // Your Express app instance
const { knex } = require("../data/knex");

const PATH_TO_ENDPOINT = "/api/v1/users";
const testUserEmail = "test@example.com";

beforeAll(async () => {
  await knex.migrate.latest();
});

afterEach(async () => {
//   await knex("users").del(); // Cleanup test database after each test
});

afterAll(async () => {
    await knex("users").where({ email: testUserEmail }).del();
    await knex.destroy();
});

describe("User Registration", () => {
  it("should create a user with email and password", async () => {
    const response = await request(app).post(PATH_TO_ENDPOINT+"/register").send({
      email: testUserEmail,
      password: "Test@1234",
      cnf_password: "Test@1234",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body.message).toBe("User created successfully.");
  });
    
  it("should not allow duplicate email registration", async () => {
    const response = await request(app).post(PATH_TO_ENDPOINT+"/register").send({
      email: testUserEmail,
        password: "Test@1234",
        cnf_password: "Test@1234"
    });
      
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email already exists!");
  });

  it("should allow user login", async () => {
    const response = await request(app).post(PATH_TO_ENDPOINT+"/login").send({
      email: testUserEmail,
        password: "Test@1234",
    });
      
    //   console.log(response.header.token);

    expect(response.status).toBe(200);
    expect(response).toHaveProperty("header.token");
    expect(response.header.token).not.toBeNull();
    expect(typeof response.header.token).toBe("string");
    expect(response.body.message).toBe("Login successful.");
  });
});
