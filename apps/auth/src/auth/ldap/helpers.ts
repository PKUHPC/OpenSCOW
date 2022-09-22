import { FastifyBaseLogger } from "fastify";
import ldapjs from "ldapjs";
import { LdapConfigSchema } from "src/config/auth";
import { promisify } from "util";

export const useLdap = (
  logger: FastifyBaseLogger,
  config: LdapConfigSchema,
  user: { dn: string, password: string } = { dn: config.bindDN, password: config.bindPassword },
) => {

  return async <T>(consume: (client: ldapjs.Client) => Promise<T>): Promise<T> => {
    const client = ldapjs.createClient(({ url: config.url, log: logger }));

    await promisify(client.bind.bind(client))(user.dn, user.password);

    return await consume(client).finally(() => {
      client.destroy();
      logger.info("Disconnected LDAP connection.");
    });
  };
};

export const searchOne = async <T>(
  logger: FastifyBaseLogger,
  client: ldapjs.Client,
  searchBase: string,
  searchOptions: ldapjs.SearchOptions,
  furtherCheck: (entry: ldapjs.SearchEntry) => T | undefined,
) => {
  return new Promise<(T & { dn: string }) | undefined>((resolve, rej) => {

    client.search(searchBase, searchOptions, (err, res) => {

      if (err) { rej(err); return; }
      logger.info("Search started");

      let found = false;

      res.on("searchEntry", (entry) => {
        if (found) {
          logger.info("An entry has already be found. Ignoring more entities.");
          return;
        }

        logger.info("Get an entry. %o", entry);

        const val = furtherCheck(entry);

        if (!val) {
          logger.info("Entity %o failed to pass further check");
          return;
        }

        found = true;
        logger.info("Get an entry with valid info. dn: %s.", entry.dn);
        res.removeAllListeners();
        res.emit("end");
        resolve({ ...val, dn: entry.dn });
      });

      res.on("searchReference", (referral) => {
        logger.info("Get a referral: " + referral.uris.join());
      });

      res.on("error", (err) => {
        logger.error("Error. %o", err);
        rej(err);
      });

      res.on("end", (result) => {
        logger.info("Received end event. %o", result);
        if (result?.status === 0) {
          resolve(undefined);
        } else {
          rej(result?.errorMessage);
        }
      });
    });
  });
};

export const findUser = async (logger: FastifyBaseLogger,
  config: LdapConfigSchema, client: ldapjs.Client, id: string) => {
  return await searchOne(logger, client, config.searchBase,
    {
      scope: "sub",
      filter: new ldapjs.AndFilter({
        filters: [
          ldapjs.parseFilter(config.userFilter),
          new ldapjs.EqualityFilter({
            attribute: config.attrs.uid,
            value: id,
          })],
      }),
    }, (e) => extractUserInfoFromEntry(config, e, logger),
  );
};

export const extractAttr = (entry: ldapjs.SearchEntry, attr: string): string[] | undefined => {
  return entry.attributes.find((x) => x.json.type === attr)?.vals as string[] | undefined;
};

export const extractUserInfoFromEntry = (
  config: LdapConfigSchema, entry: ldapjs.SearchEntry, log: FastifyBaseLogger,
) => {
  const identityId = takeOne(extractAttr(entry, config.attrs.uid));

  if (!identityId) {
    log.info("Candidate user (dn %s) doesn't has property key %s (set by ldap.attrs.uid). Ignored.");
    return undefined;
  }

  const name = config.attrs.name ? takeOne(extractAttr(entry, config.attrs.name)) : identityId;

  return { identityId, name };
};

export function takeOne(val: string | string[] | undefined) {
  if (typeof val === "string") {
    return val;
  }
  if (val === undefined) {
    return undefined;
  }
  return val[0];
}
