import { plugin } from "@ddadaal/tsgrpc-server";
import { Status } from "@grpc/grpc-js/build/src/constants";
import {
  AccountServiceServer, AccountServiceService,
} from "src/generated/clusterops/account";
import { handleError } from "src/utils/slurm";

export const accountServiceServer = plugin((server) => {
  server.addService<AccountServiceServer>(AccountServiceService, {
    createAccount: async ({ request }) => {
      const { accountName, ownerId } = request;
      const result = await server.ext.executeSlurmScript(["-c", accountName, "0", ownerId ]);

      handleError(result, { 6: Status.ALREADY_EXISTS });

      return [{ }];
    },

    deleteAccount: async ({ request }) => {
      const { accountName } = request;
      const result = await server.ext.executeSlurmScript(["-a", accountName]);

      handleError(result, { 7: Status.NOT_FOUND });
      return [{}];
    },

    blockAccount: async ({ request }) => {
      const { accountName } = request;

      const result = await server.ext.executeSlurmScript(["-b", accountName]);

      if (result.code === 8) {
        return [{ executed: false }];
      }

      handleError(result, { 7: Status.NOT_FOUND });

      return [{ executed: true }];
    },

    unblockAccount: async ({ request }) => {
      const { accountName } = request;

      const result = await server.ext.executeSlurmScript(["-d", accountName]);

      if (result.code === 9) {
        return [{ executed: false }];
      }

      handleError(result, { 7: Status.NOT_FOUND });

      return [{ executed: true }];
    },
  });
});
