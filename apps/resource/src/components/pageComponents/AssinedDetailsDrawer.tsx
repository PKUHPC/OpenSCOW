"use client";
import { Descriptions, Drawer } from "antd";
import { I18nDicType } from "src/models/i18n";
import { PartitionOperationType } from "src/models/partition";
import { AllAssignedInfoSchema } from "src/server/trpc/route/partitions/tenantClusterPartitions";

interface Props {
  open: boolean;
  operationType: PartitionOperationType,
  detail?: AllAssignedInfoSchema;
  onClose: () => void;
  language: I18nDicType;
}

type NestedKeys<T> = {
  [K in keyof T & (string | number)]: T[K] extends object ?
    T[K] extends any[] ? `${K}` : `${K}` | `${K}.${NestedKeys<T[K]>}`
    : `${K}`;
}[keyof T & (string | number)];

type DrawerItem = [
  string | ((pr: Props) => string),
  NestedKeys<AllAssignedInfoSchema>,
  (v: any) => string | null,
];

export const AssignedDetailsDrawer: React.FC<Props> = (props) => {

  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  };
  const formatPartitions = (partitions: { clusterId: string; partition: string }[]) => {
    const clusterMap: Record<string, string[]> = {};

    partitions.forEach(({ clusterId, partition }) => {
      if (!clusterMap[clusterId]) {
        clusterMap[clusterId] = [];
      }
      clusterMap[clusterId].push(partition);
    });

    return Object.entries(clusterMap)
      .map(([clusterId, partitions]) => `${clusterId} : ${partitions.join(", ")}`)
      .join("\n");
  };

  const { detail, onClose, open, language } = props;
  const drawerItems: DrawerItem[] = [
    [language.clusterPartitionManagement.details.tenantName, "tenantName", String],
    [language.clusterPartitionManagement.details.accountName, "accountName", (v) => v || null],
    [language.clusterPartitionManagement.details.assignedClustersCount,
      "assignedInfo.assignedClustersCount", (v) => v.toString()],
    [language.clusterPartitionManagement.details.assignedClusters,
      "assignedInfo.assignedClusters", (v) => v.join(", ")],
    [language.clusterPartitionManagement.details.assignedPartitionsCount,
      "assignedInfo.assignedPartitionsCount", (v) => v.toString()],
    [language.clusterPartitionManagement.details.assignedPartitions, "assignedInfo.assignedPartitions", (v) => {
      if (Array.isArray(v)) {
        return formatPartitions(v);
      }
      return null;
    }],
  ];

  return (
    <Drawer
      width={500}
      placement="right"
      onClose={onClose}
      open={open}
      title={language.common.detail}
    >
      {
        detail ? (
          <Descriptions
            column={1}
            bordered
            size="small"
          >
            {drawerItems.map(([label, key, format]) => {
              const value = getNestedValue(detail, key);
              const formattedValue = format(value);

              return formattedValue !== null ? (
                <Descriptions.Item
                  key={typeof label === "string" ? label : label(props)}
                  label={typeof label === "string" ? label : label(props)}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {formattedValue}
                </Descriptions.Item>
              ) : null;
            })}
          </Descriptions>
        ) : null
      }
    </Drawer>
  );
};
