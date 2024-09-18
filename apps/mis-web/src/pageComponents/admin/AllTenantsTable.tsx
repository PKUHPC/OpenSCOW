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

import { formatDateTime } from "@scow/lib-web/build/utils/datetime";
import { DEFAULT_PAGE_SIZE } from "@scow/lib-web/build/utils/pagination";
import { Money } from "@scow/protos/build/common/money";
import { PlatformTenantsInfo } from "@scow/protos/build/server/tenant";
import { Static } from "@sinclair/typebox";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import React, { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { type GetAllTenantsSchema } from "src/pages/api/admin/getAllTenants";
import { moneyToString } from "src/utils/money";

interface Props {
  refreshToken: boolean;
}
const p = prefix("pageComp.admin.allTenantsTable.");
const pCommon = prefix("common.");

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
  data: Static<typeof GetAllTenantsSchema["responses"]["200"]> | undefined;
  isLoading: boolean;
  reload: () => void;
}


const TenantInfoTable: React.FC<TenantInfoTableProps> = ({
  data, isLoading,
}) => {

  const t = useI18nTranslateToString();

  const columns: ColumnsType<PlatformTenantsInfo> = [
    {
      dataIndex: "tenantName",
      title: t(p("tenantName")),
      width: "35%",
    },
    {
      dataIndex: "userCount",
      title: t(pCommon("userCount")),
    },
    {
      dataIndex: "accountCount",
      title: t(p("accountCount")),
    },
    {
      dataIndex: "balance",
      title: t(pCommon("balance")),
      render: (balance: Money) => moneyToString(balance),

    },
    {
      dataIndex: "createTime",
      title: t(pCommon("createTime")),
      render: (time: string) => formatDateTime(time),
    },
  ];

  return (
    <Table
      tableLayout="fixed"
      dataSource={data?.platformTenants}
      columns={columns}
      loading={isLoading}
      pagination={{
        showSizeChanger: true,
        defaultPageSize: DEFAULT_PAGE_SIZE,
      }}
    />
  );
};

