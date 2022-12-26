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

export interface Cluster {
  id: string;
  name: string;
}


interface Props {
  clusters: Cluster[];
  value?: Cluster[];
  onChange?: (clusters: Cluster[]) => void;
}

export const ClusterSelector: React.FC<Props> = ({ clusters, value, onChange }) => {
  return (
    <Select
      mode="multiple"
      labelInValue
      placeholder="请选择集群"
      value={value ? value.map((v) => ({ value: v.id, label: v.name })) : undefined}
      onChange={(values) => onChange?.(values.map((x) => ({ id: x.value, name: x.label })))}
      options={clusters.map((x) => ({ value: x.id, label: x.name }))}
      style={{ minWidth: "96px" }}
    />
  );
};

interface SingleSelectionProps {
  clusters: Cluster[];
  value?: Cluster;
  onChange?: (cluster: Cluster) => void;
  label?: string;
}

export const SingleClusterSelector: React.FC<SingleSelectionProps> = ({ clusters, value, onChange, label }) => {
  return (
    <Select
      labelInValue
      placeholder="请选择集群"
      value={value ? ({ value: value.id, label: value.name }) : undefined}
      onChange={({ value, label }) => onChange?.({ id: value, name: label })}
      options={
        (label ? [{ value: label, label, disabled: true }] : [])
          .concat(clusters.map((x) => ({ value: x.id, label: x.name, disabled: false })))
      }
      dropdownMatchSelectWidth={false}
    />
  );
};

