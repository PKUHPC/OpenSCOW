/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { useLocalStorage } from "@scow/lib-web/build/utils/hooks";
import { Select } from "antd";
import dynamic from "next/dynamic";
import React, { PropsWithChildren } from "react";
import { Cluster, publicConfig } from "src/utils/config";
const DEFAULT_CLUSTER_KEY = "DEFAULT_CLUSTER";

const DefaultClusterContext = React.createContext<{
  defaultCluster: Cluster;
  setDefaultCluster: (cluster: Cluster) => void;
  removeDefaultCluster: () => void;
    }>(undefined!);

export const useDefaultCluster = () => React.useContext(DefaultClusterContext);

interface SingleSelectionProps {
  value?: Cluster;
  onChange?: (cluster: Cluster) => void;
  label?: string;
  clusters?: Cluster[];
}

const SingleClusterSelectorUseDefault: React.FC<SingleSelectionProps> = ({
  value,
  onChange,
  label,
  clusters,
}) => {

  const { setDefaultCluster } = useDefaultCluster();

  return (
    <Select
      labelInValue
      placeholder="请选择集群"
      value={value ? ({ value: value.id, label: value.name }) : undefined}
      onChange={({ value, label }) => {
        onChange?.({ id: value, name: label });
        setDefaultCluster({ id: value, name: label });
      }
      }
      options={
        (label ? [{ value: label, label, disabled: true }] : [])
          .concat((clusters || publicConfig.CLUSTERS).map((x) => ({ value: x.id, label: x.name, disabled: false })))
      }
      popupMatchSelectWidth={false}
    />
  );
};

export const SingleClusterSelector = dynamic(() => Promise.resolve(SingleClusterSelectorUseDefault), { ssr: false });

export const DefaultClusterProvider = ({ children }: PropsWithChildren<{}>) => {
  const [defaultCluster, setDefaultCluster] = useLocalStorage<Cluster>(
    DEFAULT_CLUSTER_KEY,
    publicConfig.CLUSTERS[0],
  );

  const removeDefaultCluster = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DEFAULT_CLUSTER_KEY);
    }
  };

  return (
    <DefaultClusterContext.Provider value={{
      defaultCluster,
      setDefaultCluster,
      removeDefaultCluster,
    }}
    >
      {children}
    </DefaultClusterContext.Provider>
  );
};
