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

import { Static } from "@sinclair/typebox";
import { Table, Tag } from "antd";
import dayjs from "dayjs";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { GetAlarmLogsSchema } from "src/pages/api/admin/monitor/getAlarmLogs";

interface Pagination {
  current: number;
  pageSize: number | undefined;
  defaultPageSize: number;
  showSizeChanger: boolean;
  total: number | undefined;
  onChange: (page: number, pageSize: number) => void;
}

interface Props {
  data: Static<typeof GetAlarmLogsSchema["responses"]["200"]> | undefined;
  isLoading: boolean;
  pagination: Pagination;
}

interface AlarmLog {
  id: number;
  fingerprint: string;
  status: string;
  severity: string;
  description: string;
  startsAt: number;
  endsAt: number | null;
}

const p = prefix("pageComp.admin.allAlarmLogsTable.");

export const AllAlarmLogsTable: React.FC<Props> = ({ data, isLoading, pagination }) => {

  const t = useI18nTranslateToString();

  const statusTexts = {
    "firing": <Tag color="error">{t(p("firing"))}</Tag>,
    "resolved": <Tag color="success">{t(p("resolved"))}</Tag>,
  };

  const severityTexts = {
    "Warning": <Tag color="warning">{"Warning"}</Tag>,
    "Error": <Tag color="error">{"Error"}</Tag>,
  };

  return (
    <Table
      dataSource={data?.results}
      loading={isLoading}
      rowKey="id"
      scroll={{ x: true }}
      pagination={pagination}
    >
      <Table.Column<AlarmLog>
        dataIndex="id"
        title={t(p("serialNumber"))}
        render={(text, record, index) => {
          const { current, pageSize } = pagination;
          return (current - 1) * (pageSize || 0) + index + 1;
        }}
      />
      <Table.Column<AlarmLog> dataIndex="fingerprint" title={t(p("fingerPrint"))} />
      <Table.Column<AlarmLog>
        dataIndex="status"
        title={t(p("status"))}
        render={(m: string) => statusTexts[m]}
      />
      <Table.Column<AlarmLog>
        dataIndex="severity"
        title={t(p("alarmLevel"))}
        render={(s: string) => severityTexts[s]}
      />
      <Table.Column<AlarmLog> dataIndex="description" title={t(p("description"))} />
      <Table.Column<AlarmLog>
        dataIndex="startsAt"
        title={t(p("firingTime"))}
        render={(s: number) => dayjs(s).format("YYYY-MM-DD HH:mm:ss")}
      />
      <Table.Column<AlarmLog>
        dataIndex="endsAt"
        title={t(p("resolvedTime"))}
        render={(e: number) => e ? dayjs(e).format("YYYY-MM-DD HH:mm:ss") : "-"}
      />
    </Table>
  );
};
