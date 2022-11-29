import "jest-extended";
module.exports = async () => {
  jest.mock("@scow/lib-auth", () => ({
    createUser: jest.fn(async () => ({ status: 204, ok: true, text: () => "" })),
    getCapabilities: jest.fn(async () => ({
      createUser: true,
      changePassword: true,
      getUser: true,
      validateName: true,
    })),
  }));
};