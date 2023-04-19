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

import { App, Button, Progress, Table } from "antd";
import { useCallback, useEffect } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { Cluster } from "src/utils/config";

interface TransferInfo {
  recvCluster: string;
  filePath: string;
  transferSize: string;
  progress: string;
  speed: string;
  leftTime: string;
}

interface TransferData {
  cluster: string;
  files: TransferInfo[];
}

export const TransferInfoTable: React.FC = () => {
  const { message, modal } = App.useApp();

  const { data: transferData, isLoading, reload } = useAsync({
    promiseFn: useCallback(async () => {
      const newTransferData: TransferData[] = [];
      const listClustersResponse = await api.listAvailableTransferClusters({ query: {} });
      const clusterList: Cluster[] = listClustersResponse.clusterList;
      await Promise.all(clusterList.map(async (cluster) => {
        const response = await api.queryFilesTransferProgress({ query: { cluster: cluster.id } });
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
      dataIndex: "recvCluster",
    },
    {
      title: "文件",
      dataIndex: "filePath",
    },
    {
      title: "传输数量",
      dataIndex: "transferSize",
    },
    {
      title: "传输速度",
      dataIndex: "speed",
    },
    {
      title: "剩余时间",
      dataIndex: "leftTime",
    },
    {
      title: "当前进度",
      dataIndex: "progress",
      render: (progress: string) => <Progress percent={parseInt(progress.replace(/%/g, ""))} />,
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
              content: `确认取消${row.cluster} -> ${row.recvCluster}的文件${row.filePath}的传输吗？`,
              okText: "确认",
              onOk: async () => {
                await api.terminateFilesTransfer({ body: {
                  toCluster: row.recvCluster,
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
