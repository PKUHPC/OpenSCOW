import { ConnectRouter } from "@connectrpc/connect";

import clusterPartitions from "./route/clusterPartitions";

export default (router: ConnectRouter) => {
  clusterPartitions(router);
};
