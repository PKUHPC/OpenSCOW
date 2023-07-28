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
import { JobInfo } from "@scow/protos/build/common/ended_job";
import { Descriptions, Drawer } from "antd";
import { getClusterName } from "src/utils/config";
import { moneyToString } from "src/utils/money";

const drawerItems = [
  ["作业ID", "biJobIndex"],
  ["集群作业ID", "idJob"],
  ["分区", "partition"],
  ["使用节点列表", "nodelist"],
  ["作业名", "jobName"],
  ["集群名", "cluster", getClusterName],
  ["提交时间", "timeSubmit", formatDateTime],
  ["开始时间", "timeStart", formatDateTime],
  ["结束时间", "timeEnd", formatDateTime],
  ["使用GPU数", "gpu"],
  ["申请CPU数", "cpusReq"],
  ["分配CPU数", "cpusAlloc"],
  ["申请的内存MB", "memReq"],
  ["分配的内存MB", "memAlloc"],
  ["申请节点数", "nodesReq"],
  ["分配节点数", "nodesAlloc"],
  ["作业时间限制（分钟）", "timelimit"],
  ["作业执行时间（秒）", "timeUsed"],
  ["作业等待时间（秒）", "timeWait"],
  ["QOS", "qos"],
  ["记录时间", "recordTime", formatDateTime],
  [
    (p) => p.showedPrices.length === 1 ? "作业计费" : "租户计费", "accountPrice",
    moneyToString, (p: Props) => p.showedPrices.includes("account")],
  [
    (p) => p.showedPrices.length === 1 ? "作业计费" : "平台计费", "tenantPrice",
    moneyToString, (p: Props) => p.showedPrices.includes("tenant")],
] as (
  | [string | ((p: Props) => string), keyof JobInfo, (v: any) => string, (p: Props) => boolean]
)[];

interface Props {
  open: boolean;
  item: JobInfo | undefined;
  onClose: () => void;
  showedPrices: ("tenant" | "account")[];
}

export const HistoryJobDrawer: React.FC<Props> = (props) => {
  const { item, onClose, open } = props;
  return (
    <Drawer
      width={500}
      placement="right"
      onClose={onClose}
      open={open}
      title="作业详细信息"
    >
      {
        item ? (
          <Descriptions
            column={1}
            bordered
            size="small"
          >
            {drawerItems.map((([label, key, format, show]) => (
              (!show || show(props)) ? (
                <Descriptions.Item key={item.idJob} label={typeof label === "string" ? label : label(props)}>
                  {format ? format(item[key]) : item[key] as string}
                </Descriptions.Item>
              ) : undefined
            ))).filter((x) => x)}
          </Descriptions>
        ) : undefined }
    </Drawer>
  );
};
