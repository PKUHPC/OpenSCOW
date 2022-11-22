import { Button, DatePicker, Divider, Form, Input, InputNumber, Space, Table } from "antd";
import dayjs from "dayjs";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { ClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer, FilterFormTabs } from "src/components/FilterFormContainer";
import { TableTitle } from "src/components/TableTitle";
import { Money } from "src/generated/common/money";
import { JobInfo } from "src/generated/server/job";
import { HistoryJobDrawer } from "src/pageComponents/job/HistoryJobDrawer";
import { JobPriceChangeModal } from "src/pageComponents/tenant/JobPriceChangeModal";
import type { GetJobFilter, GetJobInfoSchema } from "src/pages/api/job/jobInfo";
import type { Cluster } from "src/utils/config";
import { publicConfig } from "src/utils/config";
import { defaultPresets, formatDateTime } from "src/utils/datetime";
import { moneyToString, nullableMoneyToString } from "src/utils/money";

interface PageInfo {
  page: number;
  pageSize?: number;
}

interface FilterForm {
  jobEndTime: [dayjs.Dayjs, dayjs.Dayjs];
  jobId: number | undefined;
  accountName: string;
  userId: string;
  clusters: Cluster[];
}

interface Props {

}

const filterFormToQuery = (query: FilterForm, rangeSearch: boolean): GetJobFilter => {
  return {
    userId: rangeSearch ? (query.userId || undefined) : undefined,
    accountName: query.accountName || undefined,
    jobEndTimeStart: query.jobEndTime[0].toISOString(),
    jobEndTimeEnd: query.jobEndTime[1].toISOString(),
    jobId: rangeSearch ? undefined : query.jobId,
    clusters: query.clusters?.map((x) => x.id),
  };
};

export const AdminJobTable: React.FC<Props> = () => {

  const rangeSearch = useRef(true);

  const [query, setQuery] = useState<FilterForm>(() => {
    const now = dayjs();
    return {
      jobId: undefined,
      userId: "",
      accountName: "",
      jobEndTime: [now.clone().subtract(1, "week"), now],
      clusters: Object.values(publicConfig.CLUSTERS),
    };
  });
  const [form] = Form.useForm<FilterForm>();

  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: 10 });

  const promiseFn = useCallback(async () => {
    return await api.getJobInfo({ query: {
      ...filterFormToQuery(query, rangeSearch.current),
      page: pageInfo.page,
      pageSize: pageInfo.pageSize,
    } });
  }, [pageInfo, query]);

  const { data, isLoading, reload } = useAsync({ promiseFn });

  return (
    <div>
      <FilterFormContainer>
        <Form<FilterForm>
          form={form}
          initialValues={query}
          onFinish={async () => {
            setQuery(await form.validateFields());
          }}
        >
          <FilterFormTabs
            button={(
              <Form.Item>
                <Button type="primary" htmlType="submit">搜索</Button>
              </Form.Item>
            )}
            onChange={(a) => rangeSearch.current = a === "range"}
            tabs={[
              {
                title: "批量搜索", key: "range", node: (
                  <>
                    <Form.Item label="集群" name="clusters">
                      <ClusterSelector />
                    </Form.Item>
                    <Form.Item label="用户ID" name="userId">
                      <Input />
                    </Form.Item>
                    <Form.Item label="账户" name="accountName">
                      <Input />
                    </Form.Item>
                    <Form.Item label="作业结束时间" name="jobEndTime">
                      <DatePicker.RangePicker showTime allowClear={false} presets={defaultPresets} />
                    </Form.Item>
                  </>
                ),
              },
              {
                title: "精确搜索", key: "precision", node: (
                  <>
                    <Form.Item label="集群" name="clusters">
                      <ClusterSelector />
                    </Form.Item>
                    <Form.Item label="集群作业ID" name="jobId">
                      <InputNumber min={1} style={{ minWidth: "160px" }} />
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />
        </Form>
      </FilterFormContainer>
      <JobInfoTable
        target="account"
        reload={reload}
        data={data}
        isLoading={isLoading}
        pageInfo={pageInfo}
        setPageInfo={setPageInfo}
        filter={query}
        rangeSearch={rangeSearch.current}
      />
    </div>
  );
};




const ChangePriceButton: React.FC<{
  filter: GetJobFilter;
  count: number;
  target: "account" | "tenant";
  reload: () => void;
}> = ({ filter, count, target, reload }) => {

  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        调整搜索结果所有作业{target === "account" ? "租户计费" : "平台计费"}
      </Button>
      <JobPriceChangeModal
        target={target}
        reload={reload}
        onClose={() => setOpen(false)}
        open={open}
        filter={filter}
        jobCount={count}
      />
    </>
  );

};

interface JobInfoTableProps {
  data: GetJobInfoSchema["responses"]["200"] | undefined;
  pageInfo: PageInfo;
  setPageInfo?: (info: PageInfo) => void;
  isLoading: boolean;
  filter: FilterForm;
  reload: () => void;
  target: "account" | "tenant";
  rangeSearch: boolean;
}




const JobInfoTable: React.FC<JobInfoTableProps> = ({
  data, pageInfo, setPageInfo, isLoading, filter, reload, target,
  rangeSearch,
}) => {

  const [previewItem, setPreviewItem] = useState<JobInfo | undefined>(undefined);

  return (
    <>
      <TableTitle justify="space-between">
        {
          data ? (
            <div>
              <span>
            作业数量：<strong>{data.totalCount}</strong>
              </span>
              <Divider type="vertical" />
              <span>
            租户计费合计：<strong>{nullableMoneyToString(data.totalAccountPrice)} 元</strong>
              </span>
              <Divider type="vertical" />
              <span>
            平台计费合计：<strong>{nullableMoneyToString(data.totalTenantPrice)} 元</strong>
              </span>
            </div>
          ) : undefined
        }
        <Space>
          <ChangePriceButton
            reload={reload}
            filter={useMemo(() => filterFormToQuery(filter, rangeSearch), [filter, rangeSearch])}
            count={data ? data.totalCount : 0}
            target={target}
          />
        </Space>
      </TableTitle>
      <Table
        dataSource={data?.jobs}
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
        <Table.Column<JobInfo> dataIndex="idJob" title="集群作业ID" />
        <Table.Column<JobInfo> dataIndex="account" title="账户" />
        <Table.Column<JobInfo> dataIndex="user" title="用户" />
        <Table.Column<JobInfo> dataIndex="cluster" title="集群名" />
        <Table.Column<JobInfo> dataIndex="partition" title="分区" />
        <Table.Column<JobInfo> dataIndex="qos" title="QOS" />
        <Table.Column<JobInfo> dataIndex="jobName" title="作业名" />
        <Table.Column<JobInfo>
          dataIndex="timeSubmit"
          title="提交时间"
          render={(time: string) => formatDateTime(time)}
        />
        <Table.Column<JobInfo>
          dataIndex="timeEnd"
          title="结束时间"
          render={(time: string) => formatDateTime(time)}
        />
        <Table.Column<JobInfo>
          dataIndex="accountPrice"
          title="租户计费"
          render={(price: Money) => moneyToString(price)}
        />
        <Table.Column<JobInfo>
          dataIndex="tenantPrice"
          title="平台计费"
          render={(price: Money) => moneyToString(price)}
        />
        <Table.Column<JobInfo>
          title="更多"
          render={(_, r) => <a onClick={() => setPreviewItem(r)}>详情</a>}
        />
      </Table>
      <HistoryJobDrawer
        open={previewItem !== undefined}
        item={previewItem}
        onClose={() => setPreviewItem(undefined)}
        showedPrices={["account", "tenant"]}
      />
    </>
  );
};
