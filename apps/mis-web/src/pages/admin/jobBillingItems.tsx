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

import { Button, Checkbox, Form, Space } from "antd";
import { NextPage } from "next";
import Link from "next/link";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { PageTitle } from "src/components/PageTitle";
import { PlatformRole } from "src/models/User";
import { JobBillingManagementTable } from "src/pageComponents/job/JobBillingManagementTable";
import { TenantSelector } from "src/pageComponents/tenant/TenantSelector";
import { Head } from "src/utils/head";

interface FilterForm {
  tenant?: string;
  activeOnly: boolean;
}

const AdminJobBillingManagementTable: React.FC = () => {
  const [form] = Form.useForm<FilterForm>();

  const tenant = Form.useWatch("tenant", form);
  const activeOnly = Form.useWatch("activeOnly", form) ?? true;

  const { data, isLoading, reload } = useAsync({ promiseFn: useCallback(async () => {
    return await api.getBillingItems({ query: { tenant, activeOnly } });
  }, [tenant, activeOnly]) });

  return (
    <div>
      <FilterFormContainer>
        <Form
          layout="inline"
          form={form}
          initialValues={{ activeOnly: true, tenant: undefined }}
        >
          <Form.Item label="租户" name="tenant">
            <TenantSelector allowUndefined={true} placeholder="不选择返回平台计费项" />
          </Form.Item>
          <Form.Item name="activeOnly" valuePropName="checked">
            <Checkbox>只显示当前生效的计费项</Checkbox>
          </Form.Item>
          <Form.Item>
            <Space>
              <Link
                href={{ pathname: "/admin/jobBillingTable", query: { tenant } }}
                legacyBehavior
              >
                <Button>查看{tenant ? "租户" : "平台"}价格表</Button>
              </Link>
              <Button loading={isLoading} onClick={reload}>刷新</Button>
            </Space>
          </Form.Item>
        </Form>
      </FilterFormContainer>
      <JobBillingManagementTable data={data?.items} loading={isLoading} />
    </div>
  );
};

export const JobBillingItemsPage: NextPage = requireAuth((u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN))(
  () => {
    return (
      <div>
        <Head title="查询作业价格项" />
        <PageTitle titleText={"查询作业价格项"} />
        <AdminJobBillingManagementTable />
      </div>
    );
  });

export default JobBillingItemsPage;
