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
import { PlatformUserInfo } from "@scow/protos/build/server/user";
import { Static } from "@sinclair/typebox";
import { App, Button, Divider, Form, Input, Space, Table } from "antd";
import React, { useCallback, useMemo, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { ChangePasswordModalLink } from "src/components/ChangePasswordModal";
import { FilterFormContainer, FilterFormTabs } from "src/components/FilterFormContainer";
import { PlatformRoleSelector } from "src/components/PlatformRoleSelector";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { Encoding } from "src/models/exportFile";
import { PlatformRole, SortDirectionType, UsersSortFieldType } from "src/models/User";
import { ExportFileModaLButton } from "src/pageComponents/common/exportFileModal";
import { MAX_EXPORT_COUNT, urlToExport } from "src/pageComponents/file/apis";
import { type GetAllUsersSchema } from "src/pages/api/admin/getAllUsers";
import { User } from "src/stores/UserStore";
import { getRuntimeI18nConfigText } from "src/utils/config";

import { ChangeTenantModalLink } from "./ChangeTenantModal";

interface FilterForm {
  idOrName: string | undefined;
}

interface PageInfo {
  page: number;
  pageSize?: number;
}

interface SortInfo {
  sortField?: UsersSortFieldType;
  sortOrder?: SortDirectionType;
}

interface Props {
  refreshToken: boolean;
  user: User;
}

const filteredRoles = {
  "ALL_USERS": "pageComp.admin.allUserTable.allUsers",
  "PLATFORM_ADMIN": "pageComp.admin.allUserTable.platformAdmin",
  "PLATFORM_FINANCE": "pageComp.admin.allUserTable.platformFinance",
};
type FilteredRole = keyof typeof filteredRoles;

const p = prefix("pageComp.admin.allUserTable.");
const pCommon = prefix("common.");

export const AllUsersTable: React.FC<Props> = ({ refreshToken, user }) => {

  const [query, setQuery] = useState<FilterForm>(() => {
    return { idOrName: undefined };
  });

  const t = useI18nTranslateToString();
  const { message } = App.useApp();

  const [form] = Form.useForm<FilterForm>();

  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
  const [sortInfo, setSortInfo] = useState<SortInfo>({ sortField: undefined, sortOrder: undefined });
  const [currentPlatformRole, setCurrentPlatformRole] = useState<PlatformRole | undefined>(undefined);

  const promiseFn = useCallback(async () => {

    return await api.getAllUsers({
      query: {
        page: pageInfo.page,
        pageSize: pageInfo.pageSize,
        sortField: sortInfo.sortField,
        sortOrder: sortInfo.sortOrder,
        idOrName: query.idOrName,
        platformRole: currentPlatformRole,
      },
    });
  }, [query, pageInfo, sortInfo, currentPlatformRole]);
  const { data, isLoading, reload: reloadAllUsers } = useAsync({ promiseFn, watch: refreshToken });


  const { data: platformUsersCounts, isLoading: isCountLoading, reload: reloadUsersCounts } = useAsync({
    promiseFn: useCallback(
      async () => await api.getPlatformUsersCounts({ query: { idOrName: query.idOrName } }), [query, refreshToken],
    ),
  });

  const roleChangedHandlers = useMemo(() => ({
    "ALL_USERS": {
      setCurrentPlatformRole: () => setCurrentPlatformRole(undefined),
      count: platformUsersCounts?.totalCount ?? 0,
    },
    "PLATFORM_ADMIN": {
      setCurrentPlatformRole: () => setCurrentPlatformRole(PlatformRole.PLATFORM_ADMIN),
      count: platformUsersCounts?.totalAdminCount ?? 0,
    },
    "PLATFORM_FINANCE": {
      setCurrentPlatformRole: () => setCurrentPlatformRole(PlatformRole.PLATFORM_FINANCE),
      count: platformUsersCounts?.totalFinanceCount ?? 0,
    },
  }), [platformUsersCounts]);

  const handleFilterRoleChange = (role: FilteredRole) => {
    roleChangedHandlers[role].setCurrentPlatformRole();
    setPageInfo({ page: 1, pageSize: pageInfo.pageSize });
    setSortInfo({ sortField: undefined, sortOrder: undefined });
  };

  const reload = () => {
    reloadAllUsers();
    reloadUsersCounts();
  };

  const handleExport = async (columns: string[], encoding: Encoding) => {

    let total = 0;

    if (currentPlatformRole === undefined) {
      total = platformUsersCounts?.totalCount ?? 0;
    } else if (currentPlatformRole === PlatformRole.PLATFORM_ADMIN) {
      total = platformUsersCounts?.totalAdminCount ?? 0;
    } else {
      total = platformUsersCounts?.totalFinanceCount ?? 0;
    }

    if (total > MAX_EXPORT_COUNT) {
      message.error(t(pCommon("exportMaxDataErrorMsg"), [MAX_EXPORT_COUNT]));
    } else if (total <= 0) {
      message.error(t(pCommon("exportNoDataErrorMsg")));
    } else {
      window.location.href = urlToExport({
        encoding,
        exportApi: "exportUser",
        columns,
        count: total,
        query: {
          sortField: sortInfo.sortField,
          sortOrder: sortInfo.sortOrder,
          idOrName: query.idOrName,
          platformRole: currentPlatformRole,
        },
      });
    }

  };

  const exportOptions = useMemo(() => {
    return [
      { label: t(p("userId")), value: "userId" },
      { label: t(p("name")), value: "name" },
      { label: t(p("tenant")), value: "tenantName" },
      { label: t(p("availableAccounts")), value: "availableAccounts" },
      { label: t(pCommon("createTime")), value: "createTime" },
      { label: t(p("roles")), value: "platformRoles" },
    ];
  }, [t]);


  return (
    <div>
      <FilterFormContainer style={{ display: "flex", justifyContent: "space-between" }}>
        <Form<FilterForm>
          layout="inline"
          form={form}
          initialValues={query}
          onFinish={async () => {
            const { idOrName } = await form.validateFields();
            setQuery({ idOrName: idOrName === "" ? undefined : idOrName });
            setPageInfo({ page: 1, pageSize: pageInfo.pageSize });
            setSortInfo({ sortField: undefined, sortOrder: undefined });
          }}
        >
          <Form.Item label={t(p("idOrName"))} name="idOrName">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">{t(pCommon("search"))}</Button>
          </Form.Item>
          <Form.Item>
            <ExportFileModaLButton
              options={exportOptions}
              onExport={handleExport}
            >
              {t(pCommon("export"))}
            </ExportFileModaLButton>
          </Form.Item>
        </Form>
        <Space style={{ marginBottom: "-16px" }}>
          <FilterFormTabs
            tabs={Object.keys(filteredRoles).map((role) => ({
              title: `${t(filteredRoles[role])}(${roleChangedHandlers[(role as FilteredRole)].count})`,
              key: role,
            }))}
            onChange={(value) => handleFilterRoleChange(value as FilteredRole)}
          />
        </Space>

      </FilterFormContainer>
      <UserInfoTable
        data={data}
        pageInfo={pageInfo}
        setPageInfo={setPageInfo}
        sortInfo={sortInfo}
        setSortInfo={setSortInfo}
        isLoading={isLoading || isCountLoading}
        reload={reload}
        user={user}
      />
    </div>
  );
};

interface UserInfoTableProps {
  data: Static<typeof GetAllUsersSchema["responses"]["200"]> | undefined;
  pageInfo: PageInfo;
  setPageInfo?: (info: PageInfo) => void;
  sortInfo: SortInfo;
  setSortInfo?: (info: SortInfo) => void;
  isLoading: boolean;
  reload: () => void;
  user: User;
}

const UserInfoTable: React.FC<UserInfoTableProps> = ({
  data, pageInfo, setPageInfo, sortInfo, setSortInfo, isLoading, reload, user,
}) => {

  const t = useI18nTranslateToString();
  const languageId = useI18n().currentLanguage.id;

  const { message } = App.useApp();

  const handleTableChange = (_, __, sorter) => {
    if (setSortInfo) {
      setSortInfo({
        sortField: sorter.field,
        sortOrder: sorter.order,
      });
    }
  };

  return (
    <>
      <Table
        tableLayout="fixed"
        dataSource={data?.platformUsers}
        loading={isLoading}
        pagination={setPageInfo ? {
          current: pageInfo.page,
          defaultPageSize: DEFAULT_PAGE_SIZE,
          pageSize: pageInfo.pageSize,
          showSizeChanger: true,
          total: data?.totalCount,
          onChange: (page, pageSize) => setPageInfo({ page, pageSize }),
        } : false}
        onChange={handleTableChange}
        scroll={{ x: true }}
      >
        <Table.Column<PlatformUserInfo>
          dataIndex="userId"
          title={t(p("userId"))}
          sorter={true}
          sortDirections={["ascend", "descend"]}
          sortOrder={sortInfo.sortField === "userId" ? sortInfo.sortOrder : null}
        />
        <Table.Column<PlatformUserInfo>
          dataIndex="name"
          title={t(p("name"))}
          sorter={true}
          sortDirections={["ascend", "descend"]}
          sortOrder={sortInfo.sortField === "name" ? sortInfo.sortOrder : null}
        />
        <Table.Column dataIndex="tenantName" ellipsis title={t(p("tenant"))} />
        <Table.Column<PlatformUserInfo>
          dataIndex="availableAccounts"
          width="25%"
          title={t(p("availableAccounts"))}
          render={(accounts) => accounts.join(",")}
        />
        <Table.Column<PlatformUserInfo>
          dataIndex="createTime"
          width="13.5%"
          title={t(pCommon("createTime"))}
          sorter={true}
          sortDirections={["ascend", "descend"]}
          sortOrder={sortInfo.sortField === "createTime" ? sortInfo.sortOrder : null}
          render={(time: string) => formatDateTime(time)}
        />
        <Table.Column<PlatformUserInfo>
          dataIndex="roles"
          width="15%"
          title={t(p("roles"))}
          render={(_, r) => (
            <PlatformRoleSelector reload={reload} roles={r.platformRoles} userId={r.userId} currentUser={user} />
          )}
        />

        <Table.Column<PlatformUserInfo>
          dataIndex="operation"
          width="10%"
          fixed="right"
          title={t(pCommon("operation"))}
          render={(_, r) => (
            <Space split={<Divider type="vertical" />}>
              <ChangePasswordModalLink
                userId={r.userId}
                name={r.name}
                onComplete={async (newPassword) => {
                  await api.changePasswordAsPlatformAdmin({
                    body: {
                      identityId: r.userId,
                      newPassword: newPassword,
                    },
                  })
                    .httpError(404, () => { message.error(t(p("notExist"))); })
                    .httpError(501, () => { message.error(t(p("notAvailable"))); })
                    .httpError(400, (e) => {
                      if (e.code === "PASSWORD_NOT_VALID") {
                        message.error(getRuntimeI18nConfigText(languageId, "passwordPatternMessage"));
                      };
                    })
                    .then(() => { message.success(t(p("success"))); })
                    .catch(() => { message.error(t(p("fail"))); });
                }}
              >
                {t(p("changePassword"))}
              </ChangePasswordModalLink>
              <ChangeTenantModalLink
                tenantName={r.tenantName}
                name={r.name}
                userId={r.userId}
                reload={reload}
              >
                {t(p("changeTenant"))}
              </ChangeTenantModalLink>
            </Space>
          )}
        />
      </Table>
    </>
  );

};
