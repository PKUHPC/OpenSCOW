import { ReloadOutlined } from "@ant-design/icons";
import { Progress, Space } from "antd";
import React, { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { DisabledA } from "src/components/DisabledA";
import { StatCard } from "src/components/StatCard";
import { publicConfig } from "src/utils/config";
import styled from "styled-components";

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
  for (let i =0;i<units.length;i++) {
    val /= Math.pow(1024, i);
    if (val < 1024) {
      return toString(val, i);
    }
  }
  return toString(val, units.length-1);
}

export const StorageCard: React.FC<Props> = ({
  cluster, quota,
}) => {

  const { data, isLoading, run } = useAsync({
    deferFn: useCallback(async () => api.queryStorageUsage({ query: { cluster } }), [cluster]),
  });

  return (
    <StatCard
      title={`${publicConfig.CLUSTERS[cluster] ?? cluster} 存储${data ? "已使用/" : ""}总限额`}
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
            <ReloadOutlined spin={isLoading} />获取当前使用量
          </Space>
        </DisabledA>
      </Container>
    </StatCard>
  );

};
