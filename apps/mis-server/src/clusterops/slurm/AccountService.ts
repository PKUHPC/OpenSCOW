import { AccountOps } from "src/clusterops/api/account";
import { SlurmClusterInfo } from "src/clusterops/slurm";

export const slurmAccountOps = ({ executeSlurmScript }: SlurmClusterInfo): AccountOps => {

  return {
    createAccount: async ({ request, logger }) => {
      const { accountName, ownerId } = request;
      const result = await executeSlurmScript(["-c", accountName, "0", ownerId ], logger);

      if (result.code === 6) {
        return { code: "ALREADY_EXISTS" };
      }
      return { code: "OK" };
    },

    deleteAccount: async ({ request, logger }) => {
      const { accountName } = request;
      const result = await executeSlurmScript(["-a", accountName], logger);

      if (result.code === 7) {
        return { code: "NOT_FOUND" };
      }

      return { code: "OK" };
    },

    blockAccount: async ({ request, logger }) => {
      const { accountName } = request;

      const result = await executeSlurmScript(["-b", accountName], logger);

      if (result.code === 8) {
        return { code: "OK", executed: false };
      }

      if (result.code === 7) {
        return { code: "NOT_FOUND" };
      }

      return { code: "OK", executed: true };
    },

    unblockAccount: async ({ request, logger }) => {
      const { accountName } = request;

      const result = await executeSlurmScript(["-d", accountName], logger);

      if (result.code === 9) {
        return { code: "OK", executed: false };
      }

      if (result.code === 7) {
        return { code: "NOT_FOUND" };
      }

      return { code: "OK", executed: true };
    },
  };
};
