process.env.AUTH_TYPE = "ssh";
process.env.SSH_BASE_NODE = "localhost:22222";

import { FastifyInstance } from "fastify";
import { buildApp } from "src/app";

const username = "test";
const password = "test";

let server: FastifyInstance;

beforeEach(async () => {
  server = await buildApp();

  await server.ready();
});

afterEach(async () => {
  await server.close();
});

it("logs in to the ssh login", async () => {

  const callbackUrl = "/callback";

  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);
  formData.append("callbackUrl", callbackUrl);

  const resp = await server.inject({
    method: "POST",
    path: "/public/auth",
    payload: formData.toString(),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  expect(resp.statusCode).toBe(302);
});

it("fails to login with wrong credentials", async () => {

  const callbackUrl = "/callback";

  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password.repeat(2));
  formData.append("callbackUrl", callbackUrl);

  const resp = await server.inject({
    method: "POST",
    path: "/public/auth",
    payload: formData.toString(),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  expect(resp.statusCode).toBe(403);
});
