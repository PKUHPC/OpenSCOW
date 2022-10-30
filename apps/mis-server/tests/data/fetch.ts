globalThis.fetch = jest.fn(async () => ({ status: 204, ok: true })) as any;

export {};
