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
import React, { useEffect, useState } from "react";
import { api } from "src/apis";
import { Cluster, publicConfig } from "src/utils/config";


interface SingleSelectionProps {
  value?: Cluster;
  onChange?: (cluster: Cluster) => void;
  label?: string;
}

export const SingleCrossClusterTransferSelector: React.FC<SingleSelectionProps> = ({ value, onChange, label }) => {
  const [availableClusters, setAvailableClusters] = useState<Cluster[]>([]);

  useEffect(() => {
    const fetchClusters = async () => {
      const filteredClusters: Cluster[] = [];
      for (const cluster of publicConfig.CLUSTERS) {
        const response = await api.getClusterInfo({ query:{ cluster: cluster.id } });
        if (response.clusterInfo.crossClusterFilesTransfer.enabled) {
          filteredClusters.push(cluster);
        }
      }
      setAvailableClusters(filteredClusters);
    };

    fetchClusters();
  }, []);

  return (
    <Select
      labelInValue
      placeholder="请选择集群"
      value={value ? ({ value: value.id, label: value.name }) : undefined}
      onChange={({ value, label }) => onChange?.({ id: value, name: label })}
      options={
        (label ? [{ value: label, label, disabled: true }] : [])
          .concat(availableClusters.map((x) => ({ value: x.id, label: x.name, disabled: false })))
      }
      dropdownMatchSelectWidth={false}
    />
  );
};
