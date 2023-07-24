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

import { formatDateTime } from "@scow/lib-web/build/utils/datetime";
import { Descriptions, Drawer } from "antd";
import { RunningJobInfo } from "src/models/job";
import { Cluster } from "src/utils/config";

interface Props {
  open: boolean;
  item: RunningJobInfo | undefined;
  onClose: () => void;
}


const drawerItems = [
  ["集群", "cluster", (v: Cluster) => v.name],
  ["作业ID", "jobId"],
  ["账户", "account"],
  ["作业名", "name"],
  ["分区", "partition"],
  ["QOS", "qos"],
  ["节点数", "nodes"],
  ["核心数", "cores"],
  ["GPU卡数", "gpus"],
  ["状态", "state"],
  ["说明", "nodesOrReason"],
  ["运行/排队时间", "runningOrQueueTime"],
  ["提交时间", "submissionTime", formatDateTime],
  ["作业时限", "timeLimit"],
] as ([string, keyof RunningJobInfo] | [string, keyof RunningJobInfo, (v: any, r: RunningJobInfo) => string])[];

export const RunningJobDrawer: React.FC<Props> = ({
  item, onClose, open,
}) => {
  return (
    <Drawer
      width={500}
      placement="right"
      onClose={onClose}
      open={open}
      title="未结束的作业详细信息"
    >
      {
        item ? (
          <Descriptions
            column={1}
            bordered
            size="small"
          >
            {drawerItems.map(([label, key, format]) => (
              <Descriptions.Item key={item.jobId} label={label}>
                {format ? format(item[key], item) : item[key] as string}
              </Descriptions.Item>
            ))}
          </Descriptions>
        ) : undefined }
    </Drawer>
  );
};
