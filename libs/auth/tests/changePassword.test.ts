import { changePassword } from "../src/changePassword";

const authUrl = "auth:5000";

const identityId = "123";

const oldPassword = "123456";

const newPassword = "654321";


interface RequstSchema {
  method: string,
  body: string,
}

// @ts-ignore
globalThis.fetch = jest.fn((url:string, req:RequstSchema) => {
  const testBody = JSON.parse(req.body);
  const testIdentityId = testBody.identityId;
  const testOldPassword = testBody.oldPassword;

  if (testIdentityId !== identityId) {
    return { status: 404, json: () => ({}) };
  }
  else if (testOldPassword !== oldPassword) {
    return { status: 412, json: () => ({}) };
  }
  else {
    return { status: 204, json: () => ({}) };
  }
});

it("raises correct request for changing password", async () => {
  await changePassword(authUrl, identityId, oldPassword, newPassword);
    
  expect(fetch).toHaveBeenCalledWith(
    authUrl + "/password",
    {
      method: "PATCH",
      body: JSON.stringify({ identityId, oldPassword, newPassword }),
    },
  );
});

it("fails test for changing password with wrong oldpassword", async () => {
  const result = await changePassword(authUrl, identityId + "123", oldPassword, newPassword);
    
  expect(result).toEqual({ status: 404 });
});

it("fails test for changing password with the user who cannot be found", async () => {
  const result = await changePassword(authUrl, identityId, oldPassword + "123", newPassword);
      
  expect(result).toEqual({ status: 412 });
});

it("returns true for changing password", async () => {
  const result = await changePassword(authUrl, identityId, oldPassword, newPassword);
        
  expect(result).toEqual({ status: 204 });
});
  