import { Descriptions, Drawer } from "antd";
import { JobInfo } from "src/generated/server/job";
import { RunningJobInfo } from "src/models/job";
import { formatDateTime } from "src/utils/datetime";

interface Props {
  show: boolean;
  item: RunningJobInfo | undefined;
  onClose: () => void;
}


const drawerItems = [
  ["集群", "cluster", (v) => v.name],
  ["作业ID", "jobId"],
  ["账户", "account"],
  ["作业名", "name"],
  ["分区", "partition"],
  ["QOS", "qos"],
  ["节点数", "nodes"],
  ["核心数", "cores"],
  ["状态", "state"],
  ["说明", "nodesOrReason"],
  ["运行/排队时间", "runningOrQueueTime"],
  ["提交时间", "submissionTime", formatDateTime],
  ["作业时限", "timeLimit"],
] as ([string, keyof RunningJobInfo] | [string, keyof JobInfo, (v: any, r: RunningJobInfo) => string])[];

export const RunningJobDrawer: React.FC<Props> = ({
  item, onClose, show,
}) => {
  return (
    <Drawer
      width={500}
      placement="right"
      onClose={onClose}
      visible={show}
      title="未结束的作业详细信息"
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
