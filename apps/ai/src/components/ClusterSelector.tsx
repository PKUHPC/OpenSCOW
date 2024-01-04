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

"use client";

import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { Select } from "antd";
import { usePublicConfig } from "src/app/(auth)/context";
import { defaultClusterContext } from "src/app/(auth)/defaultClusterContext";
import { Cluster } from "src/server/trpc/route/config";


interface Props {
  value?: Cluster[];
  onChange?: (clusters: Cluster[]) => void;
}

export const ClusterSelector: React.FC<Props> = ({ value, onChange }) => {

  // const languageId = useI18n().currentLanguage.id;
  // const t = useI18nTranslateToString();
  const languageId = "zh_cn";
  const { publicConfig } = usePublicConfig();

  return (
    <Select
      mode="multiple"
      // placeholder={t("component.others.clusterSelector")}
      value={value?.map((v) => v.id)}
      onChange={(values) => onChange?.(values.map((x) => ({
        id: x,
        name: publicConfig.CLUSTERS.find((cluster) => cluster.id === x)?.name ?? x })))}
      options={publicConfig.CLUSTERS.map((x) => ({ value: x.id, label:
        getI18nConfigCurrentText(x.name, languageId) }))}
      key={languageId}
    />
  );
};

interface SingleSelectionProps {
  value?: Cluster;
  onChange?: (cluster: Cluster) => void;
  label?: string;
  clusterIds?: string[];
  allowClear?: boolean;
}

export const SingleClusterSelector: React.FC<SingleSelectionProps> = ({
  value,
  onChange,
  label,
  clusterIds,
  allowClear,
}) => {

  // const t = useI18nTranslateToString();
  // const languageId = useI18n().currentLanguage.id;
  const languageId = "zh_cn";
  const { publicConfig } = usePublicConfig();
  const { setDefaultCluster } = defaultClusterContext(publicConfig.CLUSTERS);

  return (
    <Select
      // placeholder={t("component.others.clusterSelector")}
      placeholder={"请选择集群"}
      value={value?.id}
      onChange={(value) => {
        onChange?.({
          id: value,
          name: publicConfig.CLUSTERS.find((cluster) => cluster.id === value)?.name ?? value });
        setDefaultCluster({
          id: value,
          name: publicConfig.CLUSTERS.find((cluster) => cluster.id === value)?.name ?? value });
      }
      }
      options={
        (label ? [{ value: label, label, disabled: true }] : [])
          .concat((publicConfig.CLUSTERS.filter((x) => clusterIds?.includes(x.id) ?? true) || [])
            .map((x) => ({
              value: x.id,
              label:  getI18nConfigCurrentText(x.name, languageId),
              disabled: false,
            })))
      }
      popupMatchSelectWidth={false}
      allowClear={allowClear}
    />
  );
};
