import { Button, Form, Space } from "antd";
import { NextPage } from "next";
import Router from "next/router";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { PageTitle } from "src/components/PageTitle";
import { EditableJobBillingTable } from "src/pageComponents/job/EditableJobBillingTable";
import { TenantSelector } from "src/pageComponents/tenant/TenantSelector";
import { Head } from "src/utils/head";
import { queryToString, useQuerystring } from "src/utils/querystring";

const AdminJobBillingTable: React.FC<{ tenant?: string }> = ({ tenant }) => {

  const { data, isLoading, reload } = useAsync({ promiseFn: useCallback(async () => {
    return await api.getBillingTable({ query: { tenant } }).then((x) => x.items);
  }, [tenant]) });

  return (
    <div>
      <FilterFormContainer>
        <Form layout="inline">
          <Form.Item label="租户">
            <TenantSelector
              placeholder="不选择来管理平台计算项"
              allowUndefined={true}
              value={tenant}
              onChange={(tenant) => Router.push({ pathname: "/admin/jobBillingTable", query: { tenant } })}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button loading={isLoading} onClick={reload}>刷新</Button>
            </Space>
          </Form.Item>
        </Form>
      </FilterFormContainer>
      <EditableJobBillingTable tenant={tenant} reload={reload} data={data} loading={isLoading} />
    </div>
  );
};

export const AdminJobBillingTablePage: NextPage = () => {
  const query = useQuerystring();

  const tenant = queryToString(query.tenant) || undefined;

  return (
    <div>
      <Head title="管理作业价格表" />
      <PageTitle titleText={"管理作业价格表"} />
      <AdminJobBillingTable tenant={tenant} />
    </div>
  );
};

export default AdminJobBillingTablePage;
