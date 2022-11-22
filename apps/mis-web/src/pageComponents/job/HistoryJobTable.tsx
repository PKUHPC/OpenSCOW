import { HttpError } from "@ddadaal/next-typed-api-routes-runtime";
import { Button, DatePicker, Divider, Form, Input, InputNumber, Select, Table } from "antd";
import dayjs from "dayjs";
import React, { useCallback, useRef, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { ClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer, FilterFormTabs } from "src/components/FilterFormContainer";
import { TableTitle } from "src/components/TableTitle";
import { Money } from "src/generated/common/money";
import { JobInfo } from "src/generated/server/job";
import { useMessage } from "src/layouts/prompts";
import { HistoryJobDrawer } from "src/pageComponents/job/HistoryJobDrawer";
import type { GetJobInfoSchema } from "src/pages/api/job/jobInfo";
import type { Cluster } from "src/utils/config";
import { publicConfig } from "src/utils/config";
import { defaultPresets, formatDateTime } from "src/utils/datetime";
import { useDidUpdateEffect } from "src/utils/hooks";
import { moneyToString, nullableMoneyToString } from "src/utils/money";

interface FilterForm {
  jobEndTime: [dayjs.Dayjs, dayjs.Dayjs];
  jobId: number | undefined;
  accountName?: string;
  userId?: string;
  clusters: Cluster[];
}

interface Props {
  userId?: string;
  accountNames: string[] | string;
  filterAccountName?: boolean;
  filterUser?: boolean;
  showUser: boolean;
  showAccount: boolean;
  showedPrices: ("tenant" | "account")[];
  priceTexts?: { tenant?: string; account?: string };
}

export const JobTable: React.FC<Props> = ({
  userId, accountNames, filterAccountName = true, filterUser = true,
  showAccount, showUser, showedPrices, priceTexts,
}) => {

  const message = useMessage();

  const rangeSearch = useRef(true);

  const [query, setQuery] = useState<FilterForm>(() => {
    const now = dayjs();
    return {
      jobEndTime: [now.subtract(1, "week"), now],
      jobId: undefined,
      clusters: Object.values(publicConfig.CLUSTERS),
      accountName: typeof accountNames === "string" ? accountNames : undefined,
    };
  });

  useDidUpdateEffect(() => {
    setQuery((q) => ({ ...q, accountName: accountNames[0] }));
  }, [accountNames]);

  const [form] = Form.useForm<FilterForm>();

  const [pageInfo, setPageInfo] = useState({ page: 1, pageSize: 10 });

  const promiseFn = useCallback(async () => {
    return await api.getJobInfo({ query: {
      userId: rangeSearch.current ? (query.userId || userId || undefined) : undefined,
      jobId: rangeSearch.current ? undefined : query.jobId,
      page: pageInfo.page,
      pageSize: pageInfo.pageSize,
      clusters: query.clusters?.map((x) => x.id),
      accountName: query.accountName || undefined,
      jobEndTimeStart: query.jobEndTime[0].toISOString(),
      jobEndTimeEnd: query.jobEndTime[1].toISOString(),
    } }).catch((e: HttpError) => {
      if (e.status === 403) {
        message.error("您没有权限查看此信息。");
        return undefined;
      } else {
        throw e;
      }
    });
  }, [pageInfo, query]);

  const { data, isLoading } = useAsync({ promiseFn });

  return (
    <div>
      <FilterFormContainer>
        <Form<FilterForm>
          form={form}
          initialValues={query}
          onFinish={async () => {
            setQuery({
              accountName: query.accountName,
              ...(await form.validateFields()),
            });
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
              { title: "批量搜索", key: "range", node: (
                <>
                  <Form.Item label="集群" name="clusters">
                    <ClusterSelector />
                  </Form.Item>
                  {
                    filterAccountName ? (
                      <Form.Item label="账户" name="accountName">
                        <Select style={{ minWidth: 96 }} allowClear>
                          {(Array.isArray(accountNames) ? accountNames : [accountNames]).map((x) => (
                            <Select.Option key={x} value={x}>{x}</Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    ) : undefined
                  }
                  {
                    filterUser ? (
                      <Form.Item label="用户ID" name="userId">
                        <Input />
                      </Form.Item>
                    ) : undefined
                  }
                  <Form.Item label="作业结束时间" name="jobEndTime">
                    <DatePicker.RangePicker
                      showTime
                      presets={defaultPresets}
                      allowClear={false}
                    />
                  </Form.Item>
                </>
              ) },
              {
                title: "精确搜索", key: "precision", node: (
                  <>
                    <Form.Item label="集群" name="clusters">
                      <ClusterSelector />
                    </Form.Item>
                    <Form.Item label="集群作业ID" name="jobId">
                      <InputNumber style={{ minWidth: "160px" }} min={1} />
                    </Form.Item>
                  </>
                ) },
            ]}
          />
        </Form>
      </FilterFormContainer>

      <JobInfoTable
        data={data}
        isLoading={isLoading}
        pageInfo={pageInfo}
        setPageInfo={setPageInfo}
        showAccount={showAccount}
        showUser={showUser}
        showedPrices={showedPrices}
        priceTexts={priceTexts}
      />
    </div>
  );
};


interface JobInfoTableProps {
  data: GetJobInfoSchema["responses"]["200"] | undefined;
  pageInfo: { page: number, pageSize: number };
  setPageInfo?: (info: { page: number, pageSize: number }) => void;
  isLoading: boolean;

  showAccount: boolean;
  showUser: boolean;
  showedPrices: ("tenant" | "account")[];
  priceTexts?: { tenant?: string; account?: string };
}

const priceText = {
  tenant: "平台计费",
  account: "租户计费",
};


export const JobInfoTable: React.FC<JobInfoTableProps> = ({
  data, pageInfo, setPageInfo, isLoading,
  showAccount, showUser, showedPrices, priceTexts,
}) => {


  const [previewItem, setPreviewItem] = useState<JobInfo | undefined>(undefined);

  const finalPriceText = {
    tenant: priceTexts?.tenant ?? priceText.tenant,
    account: priceTexts?.account ?? priceText.account,
  };

  return (
    <>
      <TableTitle justify="flex-start">
        {
          data ? (
            <div>
              <span>
            作业数量：<strong>{data.totalCount}</strong>
              </span>
              {
                showedPrices.includes("account") ? (
                  <>
                    <Divider type="vertical" />
                    <span>
                      {finalPriceText.account}合计：<strong>{nullableMoneyToString(data.totalAccountPrice)} 元</strong>
                    </span>
                  </>
                ) : undefined
              }
              {
                showedPrices.includes("tenant") ? (
                  <>
                    <Divider type="vertical" />
                    <span>
                      {finalPriceText.tenant}合计：<strong>{nullableMoneyToString(data.totalTenantPrice)} 元</strong>
                    </span>
                  </>
                ) : undefined
              }
            </div>
          ) : undefined
        }
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
        {
          showAccount ? (
            <Table.Column<JobInfo> dataIndex="account" title="账户" />
          ) : undefined
        }
        {
          showUser ? (
            <Table.Column<JobInfo> dataIndex="user" title="用户" />
          ) : undefined
        }
        <Table.Column<JobInfo> dataIndex="cluster" title="集群名" />
        <Table.Column<JobInfo> dataIndex="partition" title="分区" />
        <Table.Column<JobInfo> dataIndex="qos" title="QOS" />
        <Table.Column<JobInfo> dataIndex="jobName" title="作业名" />
        <Table.Column
          dataIndex="timeSubmit"
          title="提交时间"
          render={(time: string) => formatDateTime(time)}
        />
        <Table.Column<JobInfo>
          dataIndex="timeEnd"
          title="结束时间"
          render={(time: string) => formatDateTime(time)}
        />
        {
          showedPrices.map((v, i) => (
            <Table.Column<JobInfo>
              key={i}
              dataIndex={`${v}Price`}
              title={finalPriceText[v]}
              render={(price: Money) => moneyToString(price) + " 元"}
            />
          ))
        }
        <Table.Column<JobInfo>
          title="更多"
          render={(_, r) => <a onClick={() => setPreviewItem(r)}>详情</a>}
        />
      </Table>
      <HistoryJobDrawer
        show={previewItem !== undefined}
        item={previewItem}
        onClose={() => setPreviewItem(undefined)}
        showedPrices={showedPrices}
      />
    </>
  );
};
