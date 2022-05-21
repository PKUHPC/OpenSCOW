import { getConfigFromFile } from "@scow/config";
import { Clusters,clustersConfig } from "@scow/config/build/appConfig/clusters";

export type { Clusters };

export const clusters = getConfigFromFile(clustersConfig.schema, "clusters", false,
  process.env.NODE_ENV === "test" ? "tests/data/config" : undefined);

