import { UserOps } from "src/clusterops/api/user";
import { SlurmClusterInfo } from "src/clusterops/slurm";

export const slurmUserOps = ({ executeSlurmScript }: SlurmClusterInfo): UserOps => {

  return {
    addUser: async ({ request, logger }) => {
      const { accountName, userId } = request;
      const result = await executeSlurmScript(["-g", accountName, "0", userId], logger);
      if (result.code === 3) {
        return { code: "ALREADY_EXISTS" };
      }

      return { code: "OK" };
    },
    removeUser: async ({ request, logger }) => {
      const { accountName, userId } = request;
      const result = await executeSlurmScript(["-k", accountName, userId], logger);
      if (result.code === 4) { return { code: "NOT_FOUND" };}
      return { code: "OK" };
    },

    blockUserInAccount: async ({ request, logger }) => {
      const { accountName, userId } = request;
      const result = await executeSlurmScript(["-o", accountName, userId], logger);
      if (result.code === 4) { return { code: "NOT_FOUND" };}
      return { code: "OK" };
    },

    unblockUserInAccount: async ({ request, logger }) => {
      const { accountName, userId } = request;
      const result = await executeSlurmScript(["-r", accountName, userId], logger);
      if (result.code === 4) { return { code: "NOT_FOUND" };}
      return { code: "OK" };
    },

  };
};
