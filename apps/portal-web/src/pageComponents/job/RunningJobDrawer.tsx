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
import { prefix, useI18nTranslateToString } from "src/i18n";
import { RunningJobInfo } from "src/models/job";
import { Cluster } from "src/utils/config";

interface Props {
  open: boolean;
  item: RunningJobInfo | undefined;
  onClose: () => void;
}

const p = prefix("pageComp.job.runningJobDrawer.");


export const RunningJobDrawer: React.FC<Props> = ({
  item, onClose, open,
}) => {

  const t = useI18nTranslateToString();

  const drawerItems = [
    [t(p("cluster")), "cluster", (v: Cluster) => v.name],
    [t(p("jobId")), "jobId"],
    [t(p("account")), "account"],
    [t(p("jobName")), "name"],
    [t(p("partition")), "partition"],
    [t(p("qos")), "qos"],
    [t(p("nodes")), "nodes"],
    [t(p("cores")), "cores"],
    [t(p("gpus")), "gpus"],
    [t(p("state")), "state"],
    [t(p("nodesOrReason")), "nodesOrReason"],
    [t(p("runningOrQueueTime")), "runningOrQueueTime"],
    [t(p("submissionTime")), "submissionTime", formatDateTime],
    [t(p("timeLimit")), "timeLimit"],
  ] as ([string, keyof RunningJobInfo] | [string, keyof RunningJobInfo, (v: any, r: RunningJobInfo) => string])[];

  return (
    <Drawer
      width={500}
      placement="right"
      onClose={onClose}
      open={open}
      title={t(p("drawerTitle"))}
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
