import { moneyToNumber } from "@scow/lib-decimal";
import { Table } from "antd";
import React, { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { GetTenantInfoReply } from "src/generated/server/tenant";
import { GetAllTenantsSchema } from "src/pages/api/admin/getAllTenants";

interface Props {
  refreshToken:boolean;
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
  data: GetAllTenantsSchema["responses"]["200"] | undefined;
  isLoading: boolean;
  reload: () => void;
}


const TenantInfoTable: React.FC<TenantInfoTableProps> = ({
  data, isLoading,
}) => {
  return (
    <>
      <Table 
        dataSource={data?.platformTenants}
        loading={isLoading}
        scroll={{ x: true }}
      >
        <Table.Column<GetTenantInfoReply> dataIndex="tenantId" title="租户ID"></Table.Column>
        <Table.Column<GetTenantInfoReply> dataIndex="tenantName" title="租户名称" />
        <Table.Column<GetTenantInfoReply> dataIndex="userCount" title="用户数量" />
        <Table.Column<GetTenantInfoReply> dataIndex="accountCount" title="账户数量" />
        <Table.Column<GetTenantInfoReply>
          dataIndex="balance"
          title="余额"
          render={(_, r) => {
            return moneyToNumber(r.balance || { positive: true, yuan: 0, decimalPlace: 0 });
          }}
        />
      </Table>
    </>
  );
};

