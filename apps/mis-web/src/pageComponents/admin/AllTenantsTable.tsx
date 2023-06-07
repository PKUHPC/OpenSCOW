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
import { Money } from "@scow/protos/build/common/money";
import { PlatformTenantsInfo } from "@scow/protos/build/server/tenant";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import React, { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { GetAllTenantsSchema } from "src/pages/api/admin/getAllTenants";
import { moneyToString } from "src/utils/money";

interface Props {
  refreshToken: boolean;
}
export const AllTenantsTable: React.FC<Props> = ({ refreshToken }) => {
  const promiseFn = useCallback(async () => {
    return await api.getAllTenants({}); }, []);
  const { data, isLoading, reload } = useAsync({ promiseFn, watch: refreshToken });
  return (
    <div>
      <TenantInfoTable
        data={data}
        isLoading={isLoading}
        reload={reload}
      />
    </div>
  );
};
interface TenantInfoTableProps {
  data: typeof GetAllTenantsSchema["responses"]["200"] | undefined;
  isLoading: boolean;
  reload: () => void;
}


const TenantInfoTable: React.FC<TenantInfoTableProps> = ({
  data, isLoading,
}) => {

  const columns: ColumnsType<PlatformTenantsInfo> = [
    {
      dataIndex: "tenantId",
      title: "租户ID",
    },
    {
      dataIndex: "tenantName",
      title: "租户名称",
    },
    {
      dataIndex: "userCount",
      title: "用户数量",
    },
    {
      dataIndex: "accountCount",
      title: "账户数量",
    },
    {
      dataIndex: "balance",
      title: "余额",
      render: (balance: Money) => moneyToString(balance),

    },
    {
      dataIndex: "createTime",
      title: "创建时间",
      render: (time: string) => formatDateTime(time),
    },
  ];

  return (
    <Table
      dataSource={data?.platformTenants}
      columns={columns}
      loading={isLoading}
      scroll={{ x: true }}
      pagination={false}
    />
  );
};

