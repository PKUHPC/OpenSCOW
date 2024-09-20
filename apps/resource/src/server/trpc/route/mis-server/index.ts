import { router } from "../../def";
import { clusterPartitionsInfo, currentClusters, currentClustersPartitionsInfo } from "./cluster";

export const misServerRouter = router({
  currentClusters,
  clusterPartitionsInfo,
  currentClustersPartitionsInfo,
});
