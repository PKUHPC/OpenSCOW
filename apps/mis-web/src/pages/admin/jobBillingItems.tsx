import { Button, Checkbox, Form, Space } from "antd";
import { useWatch } from "antd/lib/form/Form";
import { NextPage } from "next";
import Link from "next/link";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { PageTitle } from "src/components/PageTitle";
import { JobBillingManagementTable } from "src/pageComponents/job/JobBillingManagementTable";
import { TenantSelector } from "src/pageComponents/tenant/TenantSelector";
import { Head } from "src/utils/head";

interface FilterForm {
  tenant?: string;
  activeOnly: boolean;
}

const AdminJobBillingManagementTable: React.FC = () => {
  const [form] = Form.useForm<FilterForm>();

  const tenant = useWatch("tenant", form);
  const activeOnly = useWatch("activeOnly", form) ?? true;

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

export const JobBillingItemsPage: NextPage = () => {
  return (
    <div>
      <Head title="查询作业价格项" />
      <PageTitle titleText={"查询作业价格项"} />
      <AdminJobBillingManagementTable />
    </div>
  );
};

export default JobBillingItemsPage;
