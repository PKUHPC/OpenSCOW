import { Table, Tag } from "antd";
import React, { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { PlatformUserInfo } from "src/generated/server/user";
import { PlatformRoleTexts } from "src/models/User";
import { GetAllUsersSchema } from "src/pages/api/admin/getAllUsers";
import { formatDateTime } from "src/utils/datetime";

interface PageInfo {
    page: number;
    pageSize?: number;
}

interface Props {
  refreshToken: boolean;
}

export const AllUsersTable: React.FC<Props> = ({ refreshToken }) => {

  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: 10 });
  
  const promiseFn = useCallback(async () => {
    return await api.getAllUsers({ query: {
      page: pageInfo.page,
      pageSize: pageInfo.pageSize,
    } });
  }, [pageInfo]);

  const { data, isLoading } = useAsync({ promiseFn, watch: refreshToken });

  return (
    <div>
      <UserInfoTable 
        data={data}
        pageInfo={pageInfo}
        setPageInfo={setPageInfo}
        isLoading={isLoading}
      />
    </div>
  );
};

interface UserInfoTableProps {
  data: GetAllUsersSchema["responses"]["200"] | undefined;
  pageInfo: PageInfo;
  setPageInfo?: (info: PageInfo) => void;
  isLoading: boolean;
}

const UserInfoTable: React.FC<UserInfoTableProps> = ({
  data, pageInfo, setPageInfo, isLoading,
}) => {
  return (
    <>
      <Table
        dataSource={data?.platformUsers}
        loading={isLoading}
        pagination={setPageInfo ? {
          current: pageInfo.page,
          defaultPageSize: 10,
          pageSize: pageInfo.pageSize,
          showSizeChanger: true,
          total: data?.totalCount,
          onChange: (page, pageSize) => setPageInfo({ page, pageSize }),
        } : false}
        scroll={{ x: true }}
      >
        <Table.Column<PlatformUserInfo> dataIndex="userId" title="用户ID" />
        <Table.Column<PlatformUserInfo> dataIndex="name" title="姓名" />
        <Table.Column<PlatformUserInfo> dataIndex="createTime" title="创建时间" 
          render={(time: string) => formatDateTime(time)}
        />
        <Table.Column<PlatformUserInfo> dataIndex="platformRoles" title="用户角色" 
          render={(_, r) => r.platformRoles.map((x) => <Tag key={x}>{PlatformRoleTexts[x]}</Tag>)}
        />
      </Table>
    </>
  );

};