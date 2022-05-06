jest.mock("undici");
import { validateToken } from "src/validateToken";
import { fetch } from "undici";

import { validToken } from "../__mocks__/undici";

const authUrl = "auth:5000";

it("raises correct request", async () => {
  await validateToken(authUrl, validToken);

  expect(fetch).toHaveBeenCalledWith(
    authUrl + "/validateToken?token=" + validToken,
    { method: "GET" },
  );
});

it("fails test for invalid token", async () => {
  const result = await validateToken(authUrl, validToken + "123");

  expect(result).toBeUndefined();
});

it("returns identityId for valid token", async () => {
  const result = await validateToken(authUrl, validToken);

  expect(result).toEqual({ identityId: validToken });
});
