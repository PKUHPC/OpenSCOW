import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { getLoginNode } from "@scow/config/build/cluster";
import { DesktopServiceServer, DesktopServiceService } from "@scow/protos/build/portal/desktop";
import { getClusterOps } from "src/clusterops";
import { configClusters } from "src/config/clusters";
import { checkActivatedClusters, checkLoginNodeInCluster } from "src/utils/clusters";
import { ensureEnabled, getDesktopConfig } from "src/utils/desktops";
import { clusterNotFound } from "src/utils/errors";

export const desktopServiceServer = plugin((server) => {

  server.addService<DesktopServiceServer>(DesktopServiceService, {
    createDesktop: async ({ request, logger }) => {
      const { cluster, loginNode: host, wm, userId, desktopName } = request;
      await checkActivatedClusters({ clusterIds: cluster });

      ensureEnabled(cluster);

      const availableWms = getDesktopConfig(cluster).wms;

      if (availableWms.find((x) => x.wm === wm) === undefined) {
        throw { code: Status.INVALID_ARGUMENT, message: `${wm} is not a acceptable wm.` } as ServiceError;
      }

      checkLoginNodeInCluster(cluster, host);

      const clusterops = getClusterOps(cluster);

      const reply = await clusterops.desktop.createDesktop({ loginNode: host, wm, userId, desktopName }, logger);

      return [{ ...reply }];

    },

    killDesktop: async ({ request, logger }) => {

      const { cluster, loginNode: host, displayId, userId } = request;
      await checkActivatedClusters({ clusterIds: cluster });

      ensureEnabled(cluster);

      checkLoginNodeInCluster(cluster, host);

      const clusterops = getClusterOps(cluster);

      await clusterops.desktop.killDesktop({ loginNode: host, userId, displayId }, logger);

      return [{}];
    },

    connectToDesktop: async ({ request, logger }) => {

      const { cluster, loginNode: host, displayId, userId } = request;
      await checkActivatedClusters({ clusterIds: cluster });

      ensureEnabled(cluster);

      checkLoginNodeInCluster(cluster, host);

      const clusterops = getClusterOps(cluster);

      const reply = await clusterops.desktop.connectToDesktop({ loginNode: host, userId, displayId }, logger);

      return [{ ...reply }];
    },

    listUserDesktops: async ({ request, logger }) => {

      const { cluster, loginNode: host, userId } = request;
      await checkActivatedClusters({ clusterIds: cluster });

      ensureEnabled(cluster);

      const clusterops = getClusterOps(cluster);

      if (host) {
        checkLoginNodeInCluster(cluster, host);
        const reply = await clusterops.desktop.listUserDesktops({ loginNode: host, userId }, logger);
        return [{ userDesktops: [{ ...reply }]}];
      }

      const clusters = configClusters;
      const loginNodes = clusters[cluster]?.loginNodes?.map(getLoginNode);
      if (!loginNodes) {
        throw clusterNotFound(cluster);
      }
      // 请求集群的所有登录节点
      return await Promise.all(loginNodes.map(async (loginNode) => {
        return await clusterops.desktop.listUserDesktops({ loginNode: loginNode.address, userId }, logger);
      })).then((response) => {
        return [{ userDesktops: response }];
      });
    },

    listAvailableWms: async ({ request }) => {

      const { cluster } = request;
      await checkActivatedClusters({ clusterIds: cluster });

      ensureEnabled(cluster);

      const result = getDesktopConfig(cluster).wms;


      return [{ wms: result }];
    },

  });

});
