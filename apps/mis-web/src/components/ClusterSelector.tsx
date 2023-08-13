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
import { useTranslation } from "next-i18next";
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
      options={Object.values(publicConfig.CLUSTERS).map((x) => ({ value: x.id, label: x.name }))}
      style={{ minWidth: "96px" }}
    />
  );
};

interface SingleSelectionProps {
  value?: Cluster;
  onChange?: (cluster: Cluster) => void;
  label?: string;
}

export const SingleClusterSelector: React.FC<SingleSelectionProps> = ({ value, onChange, label }) => {

  const { t } = useTranslation("custom");

  return (
    <Select
      labelInValue
      placeholder="请选择集群"
      // value={value ? ({ value: value.id, label: value.name }) : undefined}
      // 用户自定义翻译文本资源国际化，用户需按照指定Key值添加文本，第二参数为找不到key时的默认值
      value={value ? ({ value: value.id, label: t("custom:hpc01-text" as any, value.name) }) : undefined}
      onChange={({ value, label }) => onChange?.({ id: value, name: label })}
      options={
        (label ? [{ value: label, label, disabled: true }] : [])
          .concat(Object.values(publicConfig.CLUSTERS).map((x) => ({ value: x.id, label: x.name, disabled: false })))
      }
      dropdownMatchSelectWidth={false}
    />
  );
};

