import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import {
  ChangeStorageQuotaMode,
  StorageServiceServer,
  StorageServiceService,
} from "src/generated/clusterops/storage";
import { handleError } from "src/utils/slurm";

export const storageServiceServer = plugin((server) => {
  server.addService<StorageServiceServer>(StorageServiceService, {
    queryUsedStorageQuota: async ({ request, logger }) => {
      const { userId } = request;
      const result = await server.ext.executeSlurmScript(["-y", userId]);

      handleError(result, { 2: Status.NOT_FOUND });

      /**
       * format is
       *
       * used: 512K
       * quota: 2T
       *
       * used显示为整数位大于等于1的最大单位，比如如果是1025K的话，会显示1.001M
       */

      const usedLine = result.stdout.split("\n")
        .find((x) => x.startsWith("used:"));

      function throwError() {
        logger.error(`Unexpected -y output. stdout: ${result.stdout}`);

        throw <ServiceError> {
          code: Status.INTERNAL,
          message: "Unexpected cmdline output",
        };
      }

      if (usedLine) {
        const val = usedLine.substr("used: ".length);

        // parseFloat parses starting num, ignoring what's following a now
        const numVal = parseFloat(val);
        if (isNaN(numVal)) {
          throwError();
        }

        // parse unit to bytes
        const units = {
          "B": 0,
          "K": 1,
          "M": 2,
          "G": 3,
          "T": 4,
          "P": 5,
        };

        const unit = val[val.length-1];

        const pow = units[unit] ?? 0;

        const bytesVal = numVal * Math.pow(1024, pow);

        return [{ used: bytesVal }];
      }
      throwError();
    },

    changeStorageQuota: async ({ request }) => {
      const { userId, mode, value } = request;
      const command = {
        [ChangeStorageQuotaMode.DECREASE]: "-w",
        [ChangeStorageQuotaMode.INCREASE]: "-z",
        [ChangeStorageQuotaMode.SET]: "-x",
      };

      const result = await server.ext.executeSlurmScript([command[mode], userId, value+""]);

      handleError(result, { 4: Status.NOT_FOUND });

      // TODO handle output format
      return [{ currentQuota: 10 }];
    },
  });
});
