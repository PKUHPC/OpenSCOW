"use client";
import { Cluster } from "@scow/config/build/type";
import { Descriptions, Drawer } from "antd";
import { I18nDicType } from "src/models/i18n";
import { PartitionOperationType } from "src/models/partition";
import { AllAssignedInfoSchema } from "src/server/trpc/route/partitions/tenantClusterPartitions";
import { getCurrentClusterI18nName } from "src/utils/i18n";

interface Props {
  open: boolean;
  operationType: PartitionOperationType,
  detail?: AllAssignedInfoSchema;
  onClose: () => void;
  language: I18nDicType;
  languageId: string;
  currentClustersData?: Cluster[];
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
      const clusterName = getCurrentClusterI18nName(clusterId, languageId, currentClustersData);
      if (!clusterMap[clusterName]) {
        clusterMap[clusterName] = [];
      }
      clusterMap[clusterName].push(partition);
    });

    return Object.entries(clusterMap)
      .map(([clusterName, partitions]) => `${clusterName} :  ${partitions.join(", ")}`)
      .join("\n");
  };

  const { detail, onClose, open, language, languageId, currentClustersData } = props;
  const drawerItems: DrawerItem[] = [
    [language.clusterPartitionManagement.details.tenantName, "tenantName", String],
    [language.clusterPartitionManagement.details.accountName, "accountName", (v) => v || null],
    [language.clusterPartitionManagement.details.assignedClustersCount,
      "assignedInfo.assignedClustersCount", (v) => v.toString()],
    [language.clusterPartitionManagement.details.assignedClusters,
      "assignedInfo.assignedClusters", (v) => {
        const clusterNames = v.map((clusterId) => {
          return getCurrentClusterI18nName(clusterId, languageId, currentClustersData);
        });
        return clusterNames.join(", ");
      },
    ],
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
