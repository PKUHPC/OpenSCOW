import { Descriptions, Drawer } from "antd";
import { JobInfo } from "src/generated/server/job";
import { formatDateTime } from "src/utils/datetime";
import { moneyToString } from "src/utils/money";

const drawerItems = [
  ["作业ID", "biJobIndex"],
  ["集群作业ID", "idJob"],
  ["分区", "partition"],
  ["使用节点列表", "nodelist"],
  ["作业名", "jobName"],
  ["集群名", "cluster"],
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
  ["作业时间限制", "timelimit"],
  ["作业执行时间", "timeUsed"],
  ["作业等待时间", "timeWait"],
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
  show: boolean;
  item: JobInfo | undefined;
  onClose: () => void;
  showedPrices: ("tenant" | "account")[];
}

export const HistoryJobDrawer: React.FC<Props> = (props) => {
  const {  item, onClose, show } = props;
  return (
    <Drawer
      width={500}
      placement="right"
      onClose={onClose}
      visible={show}
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
