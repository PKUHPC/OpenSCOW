import { validateToken } from "src/validateToken";

const authUrl = "auth:5000";

const validToken = "123";

// @ts-ignore
globalThis.fetch = jest.fn((url: string) => {
  if (new URL(url).searchParams.get("token") === validToken) {
    return { status: 200, json: () => ({ identityId: validToken }) };
  } else {
    return { status: 403, json: () => ({}) };
  }
});


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
