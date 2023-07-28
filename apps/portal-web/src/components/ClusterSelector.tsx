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

import { Select } from "antd";
import dynamic from "next/dynamic";
import { useStore } from "simstate";
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";
import { Cluster, publicConfig } from "src/utils/config";

interface Props {
  value?: Cluster[];
  onChange?: (clusters: Cluster[]) => void;
}

export const ClusterSelector: React.FC<Props> = ({ value, onChange }) => {
  return (
    <Select
      mode="multiple"
      labelInValue
      placeholder="请选择集群"
      value={value ? value.map((v) => ({ value: v.id, label: v.name })) : undefined}
      onChange={(values) => onChange?.(values.map((x) => ({ id: x.value, name: x.label })))}
      options={publicConfig.CLUSTERS.map((x) => ({ value: x.id, label: x.name }))}
    />
  );
};

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

  const { setDefaultCluster } = useStore(DefaultClusterStore);

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
