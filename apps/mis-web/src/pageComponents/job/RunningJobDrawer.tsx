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
import { prefix, useI18nTranslateToString } from "src/i18n";
import { RunningJobInfo } from "src/models/job";

interface Props {
  open: boolean;
  item: RunningJobInfo | undefined;
  onClose: () => void;
}

const p = prefix("pageComp.job.runningJobDrawer.");
const pCommon = prefix("common.");

export const RunningJobDrawer: React.FC<Props> = ({
  item, onClose, open,
}) => {

  const { t } = useI18nTranslateToString();

  const drawerItems = [
    [t(pCommon("cluster")), "cluster", (v) => v.name],
    [t(pCommon("workId")), "jobId"],
    [t(pCommon("account")), "account"],
    [t(pCommon("workName")), "name"],
    [t(pCommon("partition")), "partition"],
    ["QOS", "qos"],
    [t(p("nodes")), "nodes"],
    [t(p("cores")), "cores"],
    [t(p("gpus")), "gpus"],
    [t(pCommon("status")), "state"],
    [t(p("nodesOrReason")), "nodesOrReason"],
    [t(p("runningOrQueueTime")), "runningOrQueueTime"],
    [t(pCommon("timeSubmit")), "submissionTime", formatDateTime],
    [t(p("timeLimit")), "timeLimit"],
  ] as ([string, keyof RunningJobInfo] | [string, keyof JobInfo, (v: any, r: RunningJobInfo) => string])[];


  return (
    <Drawer
      width={500}
      placement="right"
      onClose={onClose}
      open={open}
      title={t(p("detail"))}
    >
      {
        item ? (
          <Descriptions
            column={1}
            bordered
            size="small"
          >
            {drawerItems.map((([label, key, format]) => (
              <Descriptions.Item key={item.jobId} label={label}>
                {format ? format(item[key], item) : item[key]}
              </Descriptions.Item>
            )))}
          </Descriptions>
        ) : undefined }
    </Drawer>
  );
};
