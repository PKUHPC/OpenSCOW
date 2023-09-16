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

import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/i18n";
import { Select } from "antd";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { Cluster, publicConfig } from "src/utils/config";


interface Props {
  value?: Cluster[];
  onChange?: (clusters: Cluster[]) => void;
}

const p = prefix("component.others.");

export const ClusterSelector: React.FC<Props> = ({ value, onChange }) => {

  const { t } = useI18nTranslateToString();
  const languageId = useI18n().currentLanguage.id;

  return (
    <Select
      mode="multiple"
      labelInValue
      placeholder={t(p("selectCluster"))}
      value={value ? value.map((v) => ({
        value: v.id,
        label: getI18nConfigCurrentText(v.name, languageId),
      })) : undefined}
      onChange={(values) => onChange?.(values.map((x) => ({ id: x.value, name: x.label })))}
      options={Object.values(publicConfig.CLUSTERS).map((x) => ({ value: x.id, label:
        getI18nConfigCurrentText(x.name, languageId) }))}
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

  const { t } = useI18nTranslateToString();

  const languageId = useI18n().currentLanguage.id;
  return (
    <Select
      labelInValue
      placeholder={t(p("selectCluster"))}
      value={value ? ({ value: value.id, label: getI18nConfigCurrentText(value.name, languageId) }) : undefined}
      onChange={({ value, label }) => onChange?.({ id: value, name: label })}
      options={
        (label ? [{ value: label, label, disabled: true }] : [])
          .concat(Object.values(publicConfig.CLUSTERS).map((x) => ({
            value: x.id,
            label:  getI18nConfigCurrentText(x.name, languageId),
            disabled: false,
          })))
      }
      dropdownMatchSelectWidth={false}
    />
  );
};

