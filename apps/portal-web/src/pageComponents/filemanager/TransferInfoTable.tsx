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

import { TransferInfo } from "@scow/protos/build/portal/file";
import { App, Button, Progress, Table } from "antd";
import { useCallback, useEffect } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { Cluster } from "src/utils/cluster";

interface TransferData {
  cluster: string;
  files: TransferInfo[];
}

const p = prefix("pageComp.fileManagerComp.transferInfoTable.");

export const TransferInfoTable: React.FC = () => {
  const { message, modal } = App.useApp();
  const t = useI18nTranslateToString();

  const { data: transferData, reload } = useAsync({
    promiseFn: useCallback(async () => {
      const newTransferData: TransferData[] = [];
      const listClustersResponse = await api.listAvailableTransferClusters({ query: {} });
      const clusterList: Cluster[] = listClustersResponse.clusterList;
      await Promise.all(clusterList.map(async (cluster) => {
        const response = await api.queryFileTransferProgress({ query: { cluster: cluster.id } });
        newTransferData.push({
          cluster: cluster.id,
          files: response.result,
        });
      }));
      return newTransferData;
    }, []),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      reload();
    }, 1000);
    return () => clearInterval(interval);
  }, [reload]);

  const columns = [
    {
      title: t(p("srcCluster")),
      dataIndex: "cluster",
      sorter: (a, b) => a.cluster.localeCompare(b.cluster),
    },
    {
      title: t(p("dstCluster")),
      dataIndex: "toCluster",
    },
    {
      title: t(p("file")),
      dataIndex: "filePath",
    },
    {
      title: t(p("transferCount")),
      dataIndex: "transferSizeKb",
      render: (transferSizeKb: number) => transferSizeKb + "KB",
    },
    {
      title: t(p("transferSpeed")),
      dataIndex: "speedKBps",
      render: (speedKBps: number) => speedKBps.toFixed(3) + "KB/s",
    },
    {
      title: t(p("timeLeft")),
      dataIndex: "remainingTimeSeconds",
      render: (remainingTimeSeconds: number) => remainingTimeSeconds + "s",
    },
    {
      title: t(p("currentProgress")),
      dataIndex: "progress",
      render: (progress: number) => <Progress percent={progress} />,
    },
    {
      title: t(p("operation")),
      dataIndex: "action",
      render: (_, row: TransferInfo & { cluster: string }) => (
        <Button
          type="link"
          onClick={() => {
            modal.confirm({
              title: t(p("confirmCancelTitle")),
              content: t(p("confirmCancelContent"), [row.cluster, row.toCluster, row.filePath]),
              okText: t(p("confirmOk")),
              onOk: async () => {
                await api.terminateFileTransfer({ body: {
                  fromCluster: row.cluster,
                  toCluster: row.toCluster,
                  fromPath: row.filePath,
                } })
                  .then(() => {
                    message.success(t(p("cancelSuccess")));
                    reload();
                  });
              },
            });
          }}
        >
          {t(p("cancel"))}
        </Button>

      ),
    },
  ];

  const getDataSource = (datas: TransferData[] | undefined) => {
    if (!datas) {
      return [];
    }
    return datas.flatMap((data) =>
      data.files.map((file) => ({ ...file, cluster: data.cluster })),
    );
  };

  return (
    <Table
      dataSource={getDataSource(transferData)}
      columns={columns}
      pagination={false}
    />
  );
};
