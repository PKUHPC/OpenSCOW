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

import { DEFAULT_PAGE_SIZE } from "@scow/lib-web/build/utils/pagination";
import { queryToString, useQuerystring } from "@scow/lib-web/build/utils/querystring";
import { ClusterAccountInfo, ImportUsersData, UserInAccount } from "@scow/protos/build/server/admin";
import { App, Button, Checkbox, Drawer, Form, Select, Space, Table, Tooltip } from "antd";
import Router from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { ClusterAccountInfo_ImportStatus } from "src/models/User";
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";
import { publicConfig } from "src/utils/config";

const p = prefix("pageComp.admin.ImportUsersTable.");
const pCommon = prefix("common.");

export const ImportUsersTable: React.FC = () => {

  const t = useI18nTranslateToString();

  const { message } = App.useApp();

  const qs = useQuerystring();

  const defaultClusterStore = useStore(DefaultClusterStore);

  const clusterParam = queryToString(qs.cluster);
  const cluster = (publicConfig.CLUSTERS[clusterParam]
    ? publicConfig.CLUSTERS[clusterParam]
    : defaultClusterStore.cluster);

  const [form] = Form.useForm<{ whitelist: boolean}>();

  const [loading, setLoading] = useState(false);

  const promiseFn = useCallback(async () => {
    return await api.getClusterUsers({ query: {
      cluster: cluster.id,
    },
    }).then((data) => ({
      accounts: data?.accounts?.map((account) => ({
        owner: account.users[0]?.userId,
        ...account,
      })),
    }));
  }, [cluster]);

  const { data, isLoading, reload } = useAsync({ promiseFn });

  useEffect(() => {
    form.setFieldsValue({
      whitelist: true,
    });
  }, [data]);

  const [selectedAccounts, setSelectedAccounts] = useState<ClusterAccountInfo[]>();
  const [usersList, setusersList] = useState<UserInAccount[] | undefined>(undefined);

  return (
    <div>

      <Form
        form={form}
        onFinish={async () => {
          if (!data) return;

          setLoading(true);

          const { whitelist } = await form.validateFields();
          const importData = selectedAccounts?.filter(
            (a) => a.importStatus !== ClusterAccountInfo_ImportStatus.EXISTING,
          );

          if (!importData || importData.length === 0) {
            message.info(t(p("selectAccount")));
            setLoading(false);
            return;
          }

          if (!importData.every((account) =>
            account.importStatus !== ClusterAccountInfo_ImportStatus.NOT_EXISTING ||
            account.owner,
          )) {
            message.error(t(p("specifyOwner")));
            setLoading(false);
            return;
          }

          await api.importUsers({ body: {
            data: {
              accounts: importData?.map((x) => ({
                accountName: x.accountName,
                users: x.users,
                owner: x.importStatus === ClusterAccountInfo_ImportStatus.NOT_EXISTING ? x.owner! : undefined,
                blocked: x.blocked,
              })),
            } as ImportUsersData,
            whitelist,
          } })
            .httpError(400, () => { message.error(t(p("incorrectFormat"))); })
            .then(() => {
              setSelectedAccounts([]);
              message.success(t(p("importSuccess")));
            })
            .finally(() => {
              setLoading(false);
              reload();
            });
        }}
      >
        <FilterFormContainer>
          <Space align="center">
            {t(p("selectCluster"))}
            <SingleClusterSelector
              value={cluster}
              onChange={(value) => {
                Router.push({ query: { cluster: value.id } });
              }}
            />
            <Button type="primary" htmlType="submit" loading={loading}>
              {t(pCommon("import"))}
            </Button>
            <a onClick={reload}>
              {t(pCommon("fresh"))}
            </a>
          </Space>
        </FilterFormContainer>
        <Table
          rowSelection={{
            type: "checkbox",
            renderCell(_checked, record, _index, node) {
              if (record.importStatus === ClusterAccountInfo_ImportStatus.EXISTING) {
                return <Tooltip title={t(p("alreadyExist"))}>{node}</Tooltip>;
              } else if (record.importStatus === ClusterAccountInfo_ImportStatus.NOT_EXISTING) {
                return <Tooltip title={t(p("notExist"))}>{node}</Tooltip>;
              } else if (record.importStatus === ClusterAccountInfo_ImportStatus.HAS_NEW_USERS) {
                return <Tooltip title={t(p("partNotExist"))}>{node}</Tooltip>;
              }
            },
            getCheckboxProps: (r) => ({
              disabled: r.importStatus === ClusterAccountInfo_ImportStatus.EXISTING,
            }),
            onChange: (_, sr) => {
              setSelectedAccounts(sr);
            },
          }}
          loading={isLoading}
          dataSource={data?.accounts}
          scroll={{ x:true }}
          pagination={{
            showSizeChanger: true,
            defaultPageSize: DEFAULT_PAGE_SIZE,
          }}
          rowKey="accountName"
          bordered
        >
          <Table.Column<ClusterAccountInfo> dataIndex="accountName" title={t(pCommon("accountName"))} />
          <Table.Column<ClusterAccountInfo>
            dataIndex="owner"
            title={t(pCommon("owner"))}
            render={(_, r) => {
              return r.importStatus === ClusterAccountInfo_ImportStatus.NOT_EXISTING
                ? selectedAccounts?.includes(r)
                  ? (
                    <Select
                      defaultValue={r.owner || r.users[0]?.userId}
                      options={r.users.map((user) => ({ value: user.userId, label: user.userId }))}
                      style={{ width: "100%" }}
                      placeholder={t(p("selectOwner"))}
                      onChange={(value) => {
                        r.owner = value;
                      }}
                    />
                  )
                  : ""
                : r.owner;
            }
            }

          />
          <Table.Column<ClusterAccountInfo>
            dataIndex="importStatus"
            title={t(p("importStatus"))}
            render={(value) => {
              if (value === ClusterAccountInfo_ImportStatus.EXISTING) {
                return t(p("alreadyImport"));
              } else if (value === ClusterAccountInfo_ImportStatus.HAS_NEW_USERS) {
                return t(p("partImport"));
              } else {
                return t(p("notImport"));
              }
            }}
          />
          <Table.Column<ClusterAccountInfo>
            dataIndex="users"
            title={t(p("userList"))}
            render={(_, r) => (
              <a onClick={() => setusersList(r.users)}>{t("common.view")}</a>
            )}
          />
        </Table>
        <Form.Item name="whitelist" valuePropName="checked">
          <Checkbox>{t(p("addWhitelist"))}</Checkbox>
        </Form.Item>
        <Drawer
          placement="right"
          onClose={() => setusersList(undefined)}
          open={usersList !== undefined}
          title={t(p("userList"))}
        >
          <Table
            dataSource={usersList}
          >
            <Table.Column<UserInAccount> dataIndex="userId" title={t(pCommon("userId"))} />
          </Table>
        </Drawer>
      </Form>
    </div>
  );
};
