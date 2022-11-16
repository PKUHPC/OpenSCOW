globalThis.fetch = jest.fn(async () => ({ status: 204, ok: true, text: () => "" })) as any;

export {};
