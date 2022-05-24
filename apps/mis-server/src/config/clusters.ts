import { getConfigFromFile } from "@scow/config";
import { Clusters, ClustersConfigName, ClustersConfigSchema } from "@scow/config/build/appConfig/clusters";

export type { Clusters };
export const clusters = getConfigFromFile(ClustersConfigSchema, ClustersConfigName, false,
  process.env.NODE_ENV === "test" ? "tests/data/config" : undefined);

