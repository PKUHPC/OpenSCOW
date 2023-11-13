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

import { TransferInfo } from "@scow/protos/build/portal/file";
import { App, Button, Progress, Table } from "antd";
import { useCallback, useEffect } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { Cluster } from "src/utils/config";

interface TransferData {
  cluster: string;
  files: TransferInfo[];
}

export const TransferInfoTable: React.FC = () => {
  const { message, modal } = App.useApp();

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
      title: "发送集群",
      dataIndex: "cluster",
      sorter: (a, b) => a.cluster.localeCompare(b.cluster),
    },
    {
      title: "接收集群",
      dataIndex: "toCluster",
    },
    {
      title: "文件",
      dataIndex: "filePath",
    },
    {
      title: "传输数量",
      dataIndex: "transferSizeKb",
      render: (transferSizeKb: number) => transferSizeKb + "KB",
    },
    {
      title: "传输速度",
      dataIndex: "speedKBps",
      render: (speedKBps: number) => speedKBps.toFixed(3) + "KB/s",
    },
    {
      title: "剩余时间",
      dataIndex: "remainingTimeSeconds",
      render: (remainingTimeSeconds: number) => remainingTimeSeconds + "s",
    },
    {
      title: "当前进度",
      dataIndex: "progress",
      render: (progress: number) => <Progress percent={progress} />,
    },
    {
      title: "操作",
      dataIndex: "action",
      render: (_, row: TransferInfo & { cluster: string }) => (
        <Button
          type="link"
          onClick={() => {
            modal.confirm({
              title: "确认取消",
              content: `确认取消${row.cluster} -> ${row.toCluster}的文件${row.filePath}的传输吗？`,
              okText: "确认",
              onOk: async () => {
                await api.terminateFileTransfer({ body: {
                  fromCluster: row.cluster,
                  toCluster: row.toCluster,
                  fromPath: row.filePath,
                } })
                  .then(() => {
                    message.success("取消成功");
                    reload();
                  });
              },
            });
          }}
        >
            取消
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
