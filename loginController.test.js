import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

// Mock users data
const users = [
  {
    email: "test@example.com",
    password: "password123",
    subscription: "starter",
  },
];

const loginUser = (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Email or password is wrong" });
  }

  const token = jwt.sign({ id: user.email }, "secret", { expiresIn: "23h" });

  res.status(200).json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const app = express();
app.use(express.json());

app.post("/login", loginUser);

// Jest tests
describe("POST /login", () => {
  it("should return 200, token, user object {email, subscription}, data type - string", async () => {
    const user = {
      email: "test@example.com",
      password: "password123",
    };

    const response = await request(app).post("/login").send(user);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.token).toBe("string");
    expect(response.body.user).toMatchObject({
      email: expect.any(String),
      subscription: expect.any(String),
    });
  });

  it("Unauthorized", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: "wrong@example.com", password: "wrongpassword" });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      "Email or password is wrong"
    );
  });
});
