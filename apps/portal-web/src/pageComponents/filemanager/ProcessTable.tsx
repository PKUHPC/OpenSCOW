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

import { Progress, Table } from "antd";
import { useEffect, useState } from "react";
interface TransferFile {
  key: string;
  filePath: string;
  progress: number;
  speed: number;
  time: string;
}
interface Props {
  cluster: string;
  transferId: string;
  processId: string;
}
export const ProcessTable: React.FC<Props> = ({ cluster, transferId, processId }) => {
  const [transferFiles, setTransferFiles] = useState<TransferFile[]>([]);

  useEffect(() => {
    // 发起 HTTP 请求，获取数据流
    const stream = fetch(`/query-transfer-files?cluster=${cluster}&transferId=${transferId}&processId=${processId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        return res.body;
      });
    // 处理数据流
    (async () => {
      const reader = (await (stream as Promise<ReadableStream>)).getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        // 将每一行数据解析为前端需要的数据格式
        const chunk = new TextDecoder().decode(value);
        const transferFile = parseChunk(chunk);
        // 更新组件状态
        setTransferFiles((prevTransferFiles) => {
          const index = prevTransferFiles.findIndex((file) => file.key === transferFile.key);
          if (index === -1) {
            return [...prevTransferFiles, transferFile];
          } else {
            const newTransferFiles = [...prevTransferFiles];
            newTransferFiles[index] = transferFile;
            return newTransferFiles;
          }
        });
      }
    })();
  }, [cluster, transferId, processId]);

  const columns = [
    {
      title: "File Path",
      dataIndex: "filePath",
    },
    {
      title: "Progress",
      dataIndex: "progress",
      render: (progress: number) => <Progress percent={progress} />,
    },
    {
      title: "Speed",
      dataIndex: "speed",
      render: (speed: number) => <span>{speed} B/s</span>,
    },
    {
      title: "Time",
      dataIndex: "time",
    },
  ];

  return <Table dataSource={transferFiles} columns={columns} pagination={false} />;
};
function parseChunk(chunk: string): TransferFile {
  // 解析每一行数据，返回前端需要的数据格式
  const result = JSON.parse(chunk);
  return {
    key: result.filePath,
    filePath: result.filePath,
    progress: result.progress,
    speed: result.speed,
    time: result.time,
  };
}

