export const validToken = "123";

export const fetch = jest.fn((url) => {
  if (new URL(url).searchParams.get("token") === validToken) {
    return { status: 200, json: () => ({ identityId: validToken }) };
  } else {
    return { status: 403, json: () => ({}) };
  }
});
