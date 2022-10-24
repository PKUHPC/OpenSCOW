import { ExclamationCircleOutlined } from "@ant-design/icons";
import { message, Modal, Space, Table } from "antd";
import React, { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { DisabledA } from "src/components/DisabledA";
import { PlatformUserInfo } from "src/generated/server/user";
import { PlatformRole } from "src/models/User";
import { GetAllUsersSchema } from "src/pages/api/admin/getAllUsers";
import { User } from "src/stores/UserStore";
import { formatDateTime } from "src/utils/datetime";

interface PageInfo {
    page: number;
    pageSize?: number;
}

interface Props {
  refreshToken: boolean;
  user: User;
}

export const AllUsersTable: React.FC<Props> = ({ refreshToken, user }) => {

  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: 10 });

  const promiseFn = useCallback(async () => {
    return await api.getAllUsers({ query: {
      page: pageInfo.page,
      pageSize: pageInfo.pageSize,
    } });
  }, [pageInfo]);
  // 为什么这里依赖变化时生成新函数？
  const { data, isLoading, reload } = useAsync({ promiseFn, watch: refreshToken });

  return (
    <div>
      <UserInfoTable
        data={data}
        pageInfo={pageInfo}
        setPageInfo={setPageInfo}
        isLoading={isLoading}
        reload={reload}
        user={user}
      />
    </div>
  );
};

interface UserInfoTableProps {
  data: GetAllUsersSchema["responses"]["200"] | undefined;
  pageInfo: PageInfo;
  setPageInfo?: (info: PageInfo) => void;
  isLoading: boolean;
  reload: () => void;
  user: User;
}

const UserInfoTable: React.FC<UserInfoTableProps> = ({
  data, pageInfo, setPageInfo, isLoading, reload, user,
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
        <Table.Column<PlatformUserInfo>
          dataIndex="createTime"
          title="创建时间"
          render={(time: string) => formatDateTime(time)}
        />
        <Table.Column<PlatformUserInfo>
          dataIndex="platformRoles"
          title="平台管理员"
          render={(_, r) => (
            r.platformRoles.includes(PlatformRole.PLATFORM_ADMIN)
              ? (
                <Space size="middle">
                  是
                  <DisabledA
                    disabled={r.userId === user.identityId}
                    message="不能取消自己的平台管理员权限"
                    onClick={() => {
                      Modal.confirm({
                        title: "确认取消管理员权限",
                        icon: <ExclamationCircleOutlined />,
                        content: `确认要移除用户${r.name}（ID：${r.userId}）的平台管理员权限？`,
                        onOk: async () => {
                          await api.unsetPlatformRole({ body: {
                            userId: r.userId,
                            roleType: PlatformRole.PLATFORM_ADMIN,
                          } })
                            .then(() => {
                              message.success("操作成功！");
                              reload();
                            });
                        },
                      });
                    }}
                  >
                    取消
                  </DisabledA>
                </Space>
              ) : (
                <Space size="middle">
                  否
                  <a
                    onClick={() => {
                      Modal.confirm({
                        title: "确认设置为平台管理员",
                        icon: <ExclamationCircleOutlined />,
                        content: `确认要设置用户${r.name}（ID：${r.userId}）为平台管理员？`,
                        onOk: async () => {
                          await api.setPlatformRole({ body: {
                            userId: r.userId,
                            roleType: PlatformRole.PLATFORM_ADMIN,
                          } })
                            .then(() => {
                              message.success("操作成功！");
                              reload();
                            });
                        },
                      });
                    }}
                  >
                    设置
                  </a>
                </Space>
              )

          )}
        />
        <Table.Column<PlatformUserInfo>
          dataIndex="platformRoles"
          title="平台财务人员"
          render={(_, r) => (
            r.platformRoles.includes(PlatformRole.PLATFORM_FINANCE)
              ? (
                <Space size="middle">
                  是
                  <a
                    onClick={() => {
                      Modal.confirm({
                        title: "确认取消财务人员权限",
                        icon: <ExclamationCircleOutlined />,
                        content: `确认要取消用户${r.name}（ID：${r.userId}）的财务人员权限？`,
                        onOk: async () => {
                          await api.unsetPlatformRole({ body: {
                            userId: r.userId,
                            roleType: PlatformRole.PLATFORM_FINANCE,
                          } })
                            .then(() => {
                              message.success("操作成功！");
                              reload();
                            });
                        },
                      });
                    }}
                  >
                    取消
                  </a>
                </Space>
              ) : (
                <Space size="middle">
                  否
                  <a
                    onClick={() => {
                      Modal.confirm({
                        title: "确认设置为平台财务人员",
                        icon: <ExclamationCircleOutlined />,
                        content: `确认要设置用户${r.name}（ID：${r.userId}）为平台财务人员？`,
                        onOk: async () => {
                          await api.setPlatformRole({ body: {
                            userId: r.userId,
                            roleType: PlatformRole.PLATFORM_FINANCE,
                          } })
                            .then(() => {
                              message.success("操作成功！");
                              reload();
                            });
                        },
                      });
                    }}
                  >
                    设置
                  </a>
                </Space>
              )

          )}
        />
      </Table>
    </>
  );

};
