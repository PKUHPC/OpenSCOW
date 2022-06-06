import dns from "dns";

export const dnsResolve = async (host: string) => {
  const result = await dns.promises.lookup(host);

  return result.address;
};
