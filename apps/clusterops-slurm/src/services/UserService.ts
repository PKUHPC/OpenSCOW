import { plugin } from "@ddadaal/tsgrpc-server";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { UserServiceServer, UserServiceService } from "src/generated/clusterops/user";
import { handleError } from "src/utils/slurm";

export const userServiceServer = plugin((server) => {

  server.addService<UserServiceServer>(UserServiceService, {
    addUser: async ({ request }) => {
      const { accountName, userId } = request;
      const result = await server.ext.executeSlurmScript(["-g", accountName, "0", userId]);
      handleError(result, { 3: Status.ALREADY_EXISTS });
      return [{}];
    },
    removeUser: async ({ request }) => {
      const { accountName, userId } = request;
      const result = await server.ext.executeSlurmScript(["-k", accountName, userId]);
      handleError(result, { 4: Status.NOT_FOUND });
      return [{}];
    },

    blockUserInAccount: async ({ request }) => {
      const { accountName, userId } = request;
      const result = await server.ext.executeSlurmScript(["-o", accountName, userId]);
      handleError(result, { 4: Status.NOT_FOUND });
      return [{}];
    },

    unblockUserInAccount: async ({ request }) => {
      const { accountName, userId } = request;
      const result = await server.ext.executeSlurmScript(["-r", accountName, userId]);
      handleError(result, { 4: Status.NOT_FOUND });
      return [{}];
    },

  });
});
