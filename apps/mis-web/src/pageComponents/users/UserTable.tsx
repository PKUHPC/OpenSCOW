import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Divider, message, Modal, Space, Table, Tag } from "antd";
import { LinkProps } from "next/link";
import React from "react";
import { api } from "src/apis";
import { DisabledA } from "src/components/DisabledA";
import type { AccountUserInfo } from "src/generated/server/user";
import { UserRole, UserStatus } from "src/models/User";
import { SetJobChargeLimitLink } from "src/pageComponents/users/JobChargeLimitModal";
import { GetAccountUsersSchema } from "src/pages/api/users";
import { moneyToString } from "src/utils/money";

interface Props {
  data: GetAccountUsersSchema["responses"]["200"] | undefined;
  isLoading: boolean;
  reload: () => void;
  accountName: string;
  canSetAdmin: boolean;
  getJobsPageUrl: (userId: string) => LinkProps["href"];
}

const statusTexts = {
  [UserStatus.BLOCKED]: <Tag color="error">封锁</Tag>,
  [UserStatus.UNBLOCKED]: <Tag color="success">正常</Tag>,
};

const roleTags = {
  [UserRole.OWNER]: <Tag color="gold">拥有者</Tag>,
  [UserRole.ADMIN]: <Tag color="blue">管理员</Tag>,
  [UserRole.USER]: <Tag>普通用户</Tag>,
};

export const UserTable: React.FC<Props> = ({
  data, isLoading, reload, accountName, canSetAdmin,
}) => {

  return (
    <Table
      dataSource={data?.results}
      loading={isLoading}
      rowKey="userId"
      scroll={{ x: true }}
      pagination={{ showSizeChanger: true }}
    >
      <Table.Column<AccountUserInfo> dataIndex="userId" title="用户ID" />
      <Table.Column<AccountUserInfo> dataIndex="name" title="姓名" />
      <Table.Column<AccountUserInfo> dataIndex="role" title="角色"
        render={(r: UserRole) => roleTags[r]}
      />
      <Table.Column<AccountUserInfo> dataIndex="status" title="状态"
        render={(s) => statusTexts[s]}
      />
      {/* {
        Object.entries(publicConfig.CLUSTERS.map(({ id, name }) => (
          <Table.Column<AccountUserInfo> key={id} dataIndex="storageQuota" title={`${name}存储`}
            render={(_, r) => `${r.storageQuotas[id]} TB`}
          />
        )))
      } */}
      <Table.Column<AccountUserInfo> dataIndex="jobChargeLimit" title="已用额度/用户限额"
        render={(_, r) => r.jobChargeLimit && r.usedJobChargeLimit
          ? `${moneyToString(r.usedJobChargeLimit)} / ${moneyToString(r.jobChargeLimit)} 元`
          : "无"}
      />
      {/* <Table.Column<AccountUserInfo> dataIndex="storageQuota" title="作业信息"
        render={(_, r) => (
          <Link href={getJobsPageUrl(r.userId)}>
              查看
          </Link>
        )}
      /> */}
      <Table.Column<AccountUserInfo> title="操作"
        render={(_, r) => (
          <Space split={<Divider type="vertical" />}>
            <SetJobChargeLimitLink
              userId={r.userId}
              accountName={accountName}
              reload={reload}
              username={r.name}
              currentLimit={r.jobChargeLimit}
              currentUsed={r.usedJobChargeLimit}
            >
              限额管理
            </SetJobChargeLimitLink>
            {
              r.status === UserStatus.BLOCKED
                ? (
                  <a onClick={() => {
                    Modal.confirm({
                      title: "确认解除用户封锁？",
                      icon: <ExclamationCircleOutlined />,
                      content: `确认要从账户${accountName}解除用户${r.name}（ID：${r.userId}）的封锁？`,
                      onOk: async () => {
                        await api.unblockUserInAccount({ body: {
                          identityId: r.userId,
                          accountName: accountName,
                        } })
                          .then(() => {
                            message.success("解封用户成功！");
                            reload();
                          });
                      },
                    });
                  }}
                  >
                  解除封锁
                  </a>
                ) : (
                  <a onClick={() => {
                    Modal.confirm({
                      title: "确认封锁用户？",
                      icon: <ExclamationCircleOutlined />,
                      content: `确认要从账户${accountName}封锁用户${r.name}（ID：${r.userId}）？`,
                      onOk: async () => {
                        await api.blockUserInAccount({ body: {
                          identityId: r.userId,
                          accountName: accountName,
                        } })
                          .then(() => {
                            message.success("封锁用户成功！");
                            reload();
                          });
                      },
                    });
                  }}
                  >
                    封锁
                  </a>
                )
            }
            {
              canSetAdmin ? (
                r.role === UserRole.ADMIN
                  ? (
                    <a onClick={() => {
                      Modal.confirm({
                        title: "确认取消管理员权限",
                        icon: <ExclamationCircleOutlined />,
                        content: `确认取消用户${r.name} （ID：${r.userId}）在账户${accountName}的管理员权限吗？`,
                        onOk: async () => {
                          await api.unsetAdmin({ body: {
                            identityId: r.userId,
                            accountName: accountName,
                          } })
                            .then(() => {
                              message.success("操作成功！");
                              reload();
                            });
                        },
                      });
                    }}
                    >
                    取消管理员权限
                    </a>
                  ) : r.role === UserRole.USER ? (
                    <a onClick={() => {
                      Modal.confirm({
                        title: "给予管理员权限",
                        icon: <ExclamationCircleOutlined />,
                        content: `确认给予用户${r.name} （ID：${r.userId}）在账户${accountName}的管理员权限吗？`,
                        onOk: async () => {
                          await api.setAdmin({ body: {
                            identityId: r.userId,
                            accountName: accountName,
                          } })
                            .then(() => {
                              message.success("操作成功！");
                              reload();
                            });
                        },
                      });
                    }}
                    >
                    设为管理员
                    </a>
                  ) : undefined
              ) : undefined
            }
            <DisabledA
              disabled={r.role === UserRole.OWNER}
              message="不能移出账户拥有者"
              onClick={() => {
                Modal.confirm({
                  title: "确认移出用户",
                  icon: <ExclamationCircleOutlined />,
                  content: `确认要从账户${accountName}移出用户${r.name}（ID：${r.userId}）？`,
                  onOk: async () => {
                    await api.removeUserFromAccount({ body: {
                      identityId: r.userId,
                      accountName: accountName,
                    } })
                      .then(() => {
                        message.success("移出用户成功！");
                        reload();
                      });
                  },
                });
              }}
            >
              移出用户
            </DisabledA>
          </Space>
        )}
      />
    </Table>
  );
};
