/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { ReloadOutlined } from "@ant-design/icons";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { Progress, Space } from "antd";
import React, { useCallback } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { DisabledA } from "src/components/DisabledA";
import { StatCard } from "src/components/StatCard";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { ClusterInfoStore } from "src/stores/ClusterInfoStore";
import { styled } from "styled-components";

interface Props {
  cluster: string;
  quota: number;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

function byteToBiggestUnit(quota: number) {
  const units = ["B", "K", "M", "G", "T", "P"];

  function toString(val: number, i: number) {
    return val.toFixed(i === 0 ? i : 2) + " " + units[i];
  }

  let val = quota;
  for (let i = 0; i < units.length; i++) {
    val /= Math.pow(1024, i);
    if (val < 1024) {
      return toString(val, i);
    }
  }
  return toString(val, units.length - 1);
}

const p = prefix("pageComp.dashboard.storageCard.");

export const StorageCard: React.FC<Props> = ({
  cluster, quota,
}) => {

  const t = useI18nTranslateToString();
  const languageId = useI18n().currentLanguage.id;

  const { publicConfigClusters } = useStore(ClusterInfoStore);

  const { data, isLoading, run } = useAsync({
    deferFn: useCallback(async () => api.queryStorageUsage({ query: { cluster } }), [cluster]),
  });

  return (
    <StatCard
      title={`${getI18nConfigCurrentText(publicConfigClusters[cluster]?.name, languageId) ?? cluster}
      ${t(p("storage"))}${data ? t(p("storage")) + "/" : ""}${t(p("totalLimited"))}`}
    >
      <Container>
        <span style={{ fontSize: "24px" }}>
          {data ? `${byteToBiggestUnit(data.result)} / ${byteToBiggestUnit(quota)}` : byteToBiggestUnit(quota)}
        </span>

        <Progress
          percent={data ? data.result / quota * 100 : 0}
        />
        <DisabledA disabled={isLoading} onClick={run}>
          <Space>
            <ReloadOutlined spin={isLoading} />{t(p("nowUsed"))}
          </Space>
        </DisabledA>
      </Container>
    </StatCard>
  );

};
