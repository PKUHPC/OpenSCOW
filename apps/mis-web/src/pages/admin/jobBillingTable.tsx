import { Button, Form, Space } from "antd";
import { NextPage } from "next";
import Router from "next/router";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { JobBillingTable } from "src/components/JobBillingTable";
import { PageTitle } from "src/components/PageTitle";
import { TenantSelector } from "src/pageComponents/tenant/TenantSelector";
import { Head } from "src/utils/head";
import { queryToString, useQuerystring } from "src/utils/querystring";

const AdminJobBillingTable: React.FC<{ tenant?: string }> = ({ tenant }) => {

  const { data, isLoading, reload } = useAsync({ promiseFn: useCallback(async () => {
    if (tenant) {
      return await api.getBillingTable({ query: { tenant } }).then((x) => x.items);
    } else {
      return [];
    }
  }, [tenant]) });

  return (
    <div>
      <FilterFormContainer>
        <Form layout="inline">
          <Form.Item label="租户">
            <TenantSelector
              placeholder="请选择租户"
              allowUndefined={false}
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
      <JobBillingTable data={data} loading={isLoading} />
    </div>
  );
};

export const AdminJobBillingTablePage: NextPage = () => {
  const query = useQuerystring();

  const tenant = queryToString(query.tenant) || undefined;

  return (
    <div>
      <Head title="作业价格表" />
      <PageTitle titleText={"查询作业价格表"} />
      <AdminJobBillingTable tenant={tenant}/>
    </div>
  );
};

export default AdminJobBillingTablePage;
