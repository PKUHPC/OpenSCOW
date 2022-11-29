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

import { Table } from "antd";
import { JobBillingItem } from "src/generated/server/job";
import { compareDateTime, formatDateTime } from "src/utils/datetime";
import { moneyToString } from "src/utils/money";

interface Props {
  data: JobBillingItem[] | undefined;
  loading: boolean;
}

export const JobBillingManagementTable: React.FC<Props> = ({ data, loading }) => {
  return (
    <Table dataSource={data} loading={loading} rowKey="id">
      <Table.Column title="计费项ID" dataIndex={"id"} />
      <Table.Column<JobBillingItem> title="计费路径" dataIndex={"path"} />
      <Table.Column<JobBillingItem> title="所属租户" dataIndex={"tenant"} />
      <Table.Column<JobBillingItem>
        title="创建时间"
        dataIndex={"createTime"}
        sortDirections={["ascend", "descend"]}
        sorter={(a, b) => compareDateTime(a.createTime!, b.createTime!)}
        defaultSortOrder="descend"
        render={(t) => formatDateTime(t)}
      />
      <Table.Column<JobBillingItem>
        title="价格"
        dataIndex={"price"}
        render={(_, r) => r.price ? moneyToString(r.price) : ""}
      />
    </Table>
  );
};
