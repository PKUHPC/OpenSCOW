import { ExclamationCircleOutlined, InfoCircleFilled } from "@ant-design/icons";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { Descriptions, message, Modal, Space, Table, Tag } from "antd";
import { GetServerSideProps, NextPage } from "next";
import React, { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { USE_MOCK } from "src/apis/useMock";
import { ssrAuthenticate, SSRProps } from "src/auth/server";
import { DisabledA } from "src/components/DisabledA";
import { UnifiedErrorPage } from "src/components/errorPages/UnifiedErrorPage";
import { PageTitle } from "src/components/PageTitle";
import { GetAllTenantsReply, GetTenantInfoReply, TenantServiceClient } from "src/generated/server/tenant";
import { PlatformUserInfo } from "src/generated/server/user";
import { TenantRole } from "src/models/User";
import { GetAllTenantsSchema } from "src/pages/api/admin/getAllTenants";
import { GetTenantUsersSchema } from "src/pages/api/admin/getTenantUsers";
import { User } from "src/stores/UserStore";
import { ensureNotUndefined } from "src/utils/checkNull";
import { getClient } from "src/utils/client";
import { formatDateTime } from "src/utils/datetime";
import { Head } from "src/utils/head";
import { handlegRPCError } from "src/utils/server";
interface Props {
  refreshToken:boolean;
  user:User;
}
export const AllTenantsTable: React.FC<Props> = ({ refreshToken, user }) => {
  const promiseFn = useCallback(async () => {
    return await api.getAllTenants({}); }, []);
  const { data, isLoading, reload } = useAsync({ promiseFn, watch: refreshToken });
  return (
    <div>
      <TenantInfoTable 
        data={data}
        isLoading={isLoading}
        reload={reload}
        tenant={user}
      />
    </div>
  );
};
interface TenantInfoTableProps {
  data: GetAllTenantsSchema["responses"]["200"] | undefined;
  isLoading: boolean;
  reload: () => void;
  tenant: User;
}


const TenantInfoTable: React.FC<TenantInfoTableProps> = ({
  data, isLoading, reload, tenant,
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
        <Table.Column<GetTenantInfoReply> dataIndex="balance" title="余额" />
      </Table>
    </>
  );
};

