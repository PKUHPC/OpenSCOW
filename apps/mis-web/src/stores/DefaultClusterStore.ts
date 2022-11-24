import { useState } from "react";
import { Cluster } from "src/utils/config";


export function DefaultClusterStore(defaultCluster: Cluster) {
  const [cluster, setCluster] = useState<Cluster>(defaultCluster);

  return { cluster, setCluster };
}