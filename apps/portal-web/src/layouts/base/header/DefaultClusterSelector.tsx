import { useStore } from "simstate";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";

export const DefaultClusterSelector: React.FC = () => {
  const defaultClusterStore = useStore(DefaultClusterStore);

  return (
    <SingleClusterSelector 
      value={defaultClusterStore.cluster} 
      onChange={(cluster) => {
        defaultClusterStore.setCluster(cluster);
      }} 
      label="选择默认集群"
    />
  );
};