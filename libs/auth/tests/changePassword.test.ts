import { changePassword } from "src/changePassword";

const authUrl = "auth:5000";

const identityId = "123";

const oldPassword = "123456";

const newPassword = "654321";

// @ts-ignore
globalThis.fetch = jest.fn((url: string) => {
  if (new URL(url).pathname === "/changePassword") {
    return { status: 204 };
  } else {
    return { status: 404 };
  }
});

it("raises correct request for changing password", async () => {
  await changePassword(authUrl, identityId, oldPassword, newPassword);
    
  expect(fetch).toHaveBeenCalledWith(
    authUrl + "/changePassword",
    {
      method: "POST",
      body: JSON.stringify({ identityId, oldPassword, newPassword }),
      headers: { "Content-Type": "application/json" },
    },
  );
});

it("fails test for changing password with wrong oldpassword", async () => {
  const result = await changePassword(authUrl, identityId, oldPassword + "123", newPassword);
    
  expect(result).toBeUndefined();
});

it("returns true for changing password", async () => {
  const result = await changePassword(authUrl, identityId, oldPassword, newPassword);
        
  expect(result).toEqual({ status: 204 });
});
  