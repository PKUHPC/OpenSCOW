/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { compareDateTime, formatDateTime } from "@scow/lib-web/build/utils/datetime";
import { JobBillingItem } from "@scow/protos/build/server/job";
import { Table } from "antd";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { moneyToString } from "src/utils/money";

interface Props {
  data: JobBillingItem[] | undefined;
  loading: boolean;
}

const p = prefix("pageComp.job.jobBillingManagementTable.");
const pCommon = prefix("common.");

export const JobBillingManagementTable: React.FC<Props> = ({ data, loading }) => {

  const t = useI18nTranslateToString();

  return (
    <Table dataSource={data} loading={loading} rowKey="id">
      <Table.Column title={t(p("priceId"))} dataIndex={"id"} />
      <Table.Column title={t(p("path"))} dataIndex={"path"} />
      <Table.Column title={t(p("tenant"))} dataIndex={"tenant"} />
      <Table.Column<JobBillingItem>
        title={t(pCommon("createTime"))}
        dataIndex={"createTime"}
        sortDirections={["ascend", "descend"]}
        sorter={(a, b) => compareDateTime(a.createTime!, b.createTime!)}
        defaultSortOrder="descend"
        render={(t) => formatDateTime(t)}
      />
      <Table.Column<JobBillingItem>
        title={t(pCommon("price"))}
        dataIndex={"price"}
        render={(_, r) => r.price ? moneyToString(r.price) : ""}
      />
    </Table>
  );
};
