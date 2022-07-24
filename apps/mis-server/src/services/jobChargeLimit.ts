import { plugin } from "@ddadaal/tsgrpc-server";
import { ensureNotUndefined } from "@ddadaal/tsgrpc-utils";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { LockMode } from "@mikro-orm/core";
import { Decimal } from "@scow/lib-decimal";
import { moneyToNumber } from "@scow/lib-decimal/build/convertion";
import { UserAccount } from "src/entities/UserAccount";
import { JobChargeLimitServiceServer, JobChargeLimitServiceService } from "src/generated/server/jobChargeLimit";

export const jobChargeLimitServer = plugin((server) => {
  server.addService<JobChargeLimitServiceServer>(JobChargeLimitServiceService, {
    cancelJobChargeLimit: async ({ request, em, logger }) => {
      const { accountName, userId, tenantName } = request;

      await em.transactional(async (em) => {
        const userAccount = await em.findOne(UserAccount, {
          user: { userId, tenant: { name: tenantName } },
          account: { accountName, tenant: { name: tenantName } },
        });

        if (!userAccount) {
          throw <ServiceError>{
            code: Status.NOT_FOUND,
            details: "User is not found in account.",
          };
        }

        if (!userAccount.jobChargeLimit) {
          throw <ServiceError> {
            code: Status.NOT_FOUND,
            details: "The user in account has no limit",
          };
        }

        logger.info("Job Charge Limit %s/%s of user %s account %s has been canceled.",
          userAccount.usedJobCharge?.toFixed(2),
          userAccount.jobChargeLimit.toFixed(2),
          userId,
          accountName,
        );

        userAccount.jobChargeLimit = undefined;
        userAccount.usedJobCharge = undefined;
      });

      return [{}];
    },

    setJobChargeLimit: async ({ request, em, logger }) => {
      const { accountName, limit, userId, tenantName } = ensureNotUndefined(request, ["limit"]);

      await em.transactional(async (em) => {
        const userAccount = await em.findOne(UserAccount, {
          user: { userId, tenant: { name: tenantName } },
          account: { accountName, tenant: { name: tenantName } },
        }, {
          populate: ["user", "account"],
          lockMode: LockMode.PESSIMISTIC_WRITE,
        });

        if (!userAccount) {
          throw <ServiceError>{
            code: Status.NOT_FOUND,
            details: "User is not found in account.",
          };
        }

        await userAccount.setJobCharge(new Decimal(moneyToNumber(limit)), server.ext, logger);

        logger.info("Set %s job charge limit to user %s account %s. Current used %s",
          userAccount.jobChargeLimit!.toFixed(2),
          userId,
          accountName,
          userAccount.usedJobCharge!.toFixed(2),
        );
      });

      return [{}];
    },

    // addJobCharge: async ({ request, em, logger }) => {
    //   const { accountName, charge, userId } = ensureNotUndefined(request, ["charge"]);

    //   await em.transactional(async (em) => {
    //     const userAccount = await em.findOne(UserAccount, {
    //       user: { userId },
    //       account: { accountName },
    //     }, {  populate: ["user", "account"], lockMode: LockMode.PESSIMISTIC_WRITE });

    //     if (!userAccount) {
    //       throw <ServiceError>{
    //         code: Status.NOT_FOUND,
    //         details: "User is not found in account.",
    //       };
    //     }

    //     const chargeNumber = moneyToNumber(charge);
    //     if (userAccount.usedJobCharge && userAccount.jobChargeLimit) {
    //       userAccount.usedJobCharge = userAccount.usedJobCharge.plus(chargeNumber);
    //       if (userAccount.usedJobCharge.gt(userAccount.jobChargeLimit)) {
    //         await userAccount.block(server.ext.clusters);
    //       } else {
    //         await userAccount.unblock(server.ext.clusters);
    //       }

    //       logger.info("Add job charge %s to user %s account %s. Current: %s/%s",
    //         chargeNumber.toFixed(2),
    //         userId,
    //         accountName,
    //         userAccount.usedJobCharge.toFixed(2),
    //         userAccount.jobChargeLimit.toFixed(2),
    //       );
    //     }
    //   });

    //   return [{}];

    // },
  });
});
