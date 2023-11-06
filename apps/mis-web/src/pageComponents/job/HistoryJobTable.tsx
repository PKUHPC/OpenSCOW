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

import { HttpError } from "@ddadaal/next-typed-api-routes-runtime";
import { formatDateTime, getDefaultPresets } from "@scow/lib-web/build/utils/datetime";
import { useDidUpdateEffect } from "@scow/lib-web/build/utils/hooks";
import { JobInfo } from "@scow/protos/build/common/ended_job";
import { Money } from "@scow/protos/build/common/money";
import { Static } from "@sinclair/typebox";
import { App, AutoComplete, Button, DatePicker, Divider, Form, Input, InputNumber, Space, Table } from "antd";
import dayjs from "dayjs";
import React, { useCallback, useRef, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { ClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer, FilterFormTabs } from "src/components/FilterFormContainer";
import { TableTitle } from "src/components/TableTitle";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { HistoryJobDrawer } from "src/pageComponents/job/HistoryJobDrawer";
import type { GetJobInfoSchema } from "src/pages/api/job/jobInfo";
import { getSortedClusterValues } from "src/utils/cluster";
import type { Cluster } from "src/utils/config";
import { getClusterName } from "src/utils/config";
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

const p = prefix("pageComp.job.historyJobTable.");
const pCommon = prefix("common.");

export const JobTable: React.FC<Props> = ({
  userId, accountNames, filterAccountName = true, filterUser = true,
  showAccount, showUser, showedPrices, priceTexts,
}) => {

  const t = useI18nTranslateToString();
  const languageId = useI18n().currentLanguage.id;

  const { message } = App.useApp();

  const rangeSearch = useRef(true);

  const [pageInfo, setPageInfo] = useState({ page: 1, pageSize: 10 });
  const [selectedAccountName, setSelectedAccountName] = useState<string | undefined>(undefined);

  const [query, setQuery] = useState<FilterForm>(() => {
    const now = dayjs();
    return {
      jobEndTime: [now.subtract(1, "week").startOf("day"), now.endOf("day")],
      jobId: undefined,
      clusters: getSortedClusterValues(),
      accountName: typeof accountNames === "string" ? accountNames : undefined,
    };
  });

  useDidUpdateEffect(() => {
    setPageInfo({ page: 1, pageSize: pageInfo.pageSize });
    setQuery((q) => ({
      ...q,
      accountName: Array.isArray(accountNames) ? accountNames[0] : accountNames,
    }));

  }, [accountNames]);

  const [form] = Form.useForm<FilterForm>();


  const promiseFn = useCallback(async () => {
    // 根据 rangeSearch.current来判断是批量/精确搜索，
    // accountName 根据accountNames是否数组来判断顶部导航类型，如是用户空间用输入值，账户管理则用props中的accountNames限制搜索范围
    const diffQuery = rangeSearch.current ? {
      userId: userId || query.userId,
      accountName: Array.isArray(accountNames) ? selectedAccountName : accountNames,
      jobEndTimeStart: query.jobEndTime[0].toISOString(),
      jobEndTimeEnd: query.jobEndTime[1].toISOString(),
    } : {
      userId: userId,
      jobId: query.jobId,
      accountName: Array.isArray(accountNames) ? undefined : accountNames,
    };
    return await api.getJobInfo({ query: {
      ...diffQuery,
      page: pageInfo.page,
      pageSize: pageInfo.pageSize,
      clusters: query.clusters?.map((x) => x.id),
    } }).catch((e: HttpError) => {
      if (e.status === 403) {
        message.error(t(p("noAuth")));
        return undefined;
      } else {
        throw e;
      }
    });
  }, [pageInfo, query]);

  const { data, isLoading, reload } = useAsync({ promiseFn });

  return (
    <div>
      <FilterFormContainer>
        <Form<FilterForm>
          form={form}
          initialValues={query}
          onFinish={async () => {
            const currentQuery = await form.validateFields();
            setQuery(currentQuery);
            setPageInfo({ page: 1, pageSize: pageInfo.pageSize });
          }}
        >
          <FilterFormTabs
            button={(
              <Space>
                <Button type="primary" htmlType="submit">{t(pCommon("search"))}</Button>
                <Button onClick={reload} loading={isLoading}>{t(pCommon("fresh"))}</Button>
              </Space>
            )}
            onChange={(a) => rangeSearch.current = a === "range"}
            tabs={[
              { title: t(p("batchSearch")), key: "range", node: (
                <>
                  <Form.Item label={t(pCommon("cluster"))} name="clusters">
                    <ClusterSelector />
                  </Form.Item>
                  {
                    filterAccountName ? (
                      <Form.Item label={t("common.account")} name="name">
                        <AutoComplete
                          style={{ minWidth: 150 }}
                          allowClear
                          options={
                            (Array.isArray(accountNames) ? accountNames : [accountNames]).map((x) => ({ value: x }))
                          }
                          placeholder={t("common.selectAccount")}
                          filterOption={(inputValue, option) =>
                            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                          }
                          onChange={(value) => {
                            setSelectedAccountName(value || undefined);
                          }}
                        />
                      </Form.Item>
                    ) : undefined
                  }
                  {
                    filterUser ? (
                      <Form.Item label={t(pCommon("userId"))} name="userId">
                        <Input />
                      </Form.Item>
                    ) : undefined
                  }
                  <Form.Item label={t(p("jobEndTime"))} name="jobEndTime">
                    <DatePicker.RangePicker
                      showTime
                      presets={getDefaultPresets(languageId)}
                      allowClear={false}
                    />
                  </Form.Item>
                </>
              ) },
              {
                title: t(p("precision")), key: "precision", node: (
                  <>
                    <Form.Item label={t(pCommon("cluster"))} name="clusters">
                      <ClusterSelector />
                    </Form.Item>
                    <Form.Item label={t(pCommon("workId"))} name="jobId">
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
  data: Static<typeof GetJobInfoSchema["responses"]["200"]> | undefined;
  pageInfo: { page: number, pageSize: number };
  setPageInfo?: (info: { page: number, pageSize: number }) => void;
  isLoading: boolean;

  showAccount: boolean;
  showUser: boolean;
  showedPrices: ("tenant" | "account")[];
  priceTexts?: { tenant?: string; account?: string };
}

const priceText = {
  tenant: "platformPrice",
  account: "tenantPrice",
} as const;


export const JobInfoTable: React.FC<JobInfoTableProps> = ({
  data, pageInfo, setPageInfo, isLoading,
  showAccount, showUser, showedPrices, priceTexts,
}) => {

  const t = useI18nTranslateToString();
  const languageId = useI18n().currentLanguage.id;

  const [previewItem, setPreviewItem] = useState<JobInfo | undefined>(undefined);

  const finalPriceText = {
    tenant: priceTexts?.tenant ?? t(p(priceText.tenant)),
    account: priceTexts?.account ?? t(p(priceText.account)),
  };

  return (
    <>
      <TableTitle justify="flex-start">
        {
          data ? (
            <div>
              <span>
                {t(p("jobNumber"))}：<strong>{data.totalCount}</strong>
              </span>
              {
                showedPrices.includes("account") ? (
                  <>
                    <Divider type="vertical" />
                    <span>
                      {finalPriceText.account}{t(pCommon("sum"))}：
                      <strong>{nullableMoneyToString(data.totalAccountPrice)} {t(pCommon("unit"))}</strong>
                    </span>
                  </>
                ) : undefined
              }
              {
                showedPrices.includes("tenant") ? (
                  <>
                    <Divider type="vertical" />
                    <span>
                      {finalPriceText.tenant}{t(pCommon("sum"))}：
                      <strong>{nullableMoneyToString(data.totalTenantPrice)} {t(pCommon("unit"))}</strong>
                    </span>
                  </>
                ) : undefined
              }
            </div>
          ) : undefined
        }
      </TableTitle>
      <Table
        rowKey={(i) => i.cluster + i.biJobIndex + i.idJob}
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
        <Table.Column<JobInfo> dataIndex="idJob" title={t(pCommon("clusterWorkId"))} />
        {
          showAccount ? (
            <Table.Column<JobInfo> dataIndex="account" title={t(pCommon("account"))} />
          ) : undefined
        }
        {
          showUser ? (
            <Table.Column<JobInfo> dataIndex="user" title={t(pCommon("user"))} />
          ) : undefined
        }
        <Table.Column<JobInfo>
          dataIndex="cluster"
          title={t(pCommon("clusterName"))}
          render={(cluster) => getClusterName(cluster, languageId)}
        />
        <Table.Column<JobInfo> dataIndex="partition" title={t(pCommon("partition"))} />
        <Table.Column<JobInfo> dataIndex="qos" title="QOS" />
        <Table.Column<JobInfo> dataIndex="jobName" title={t(pCommon("workName"))} />
        <Table.Column
          dataIndex="timeSubmit"
          title={t(pCommon("timeSubmit"))}
          render={(time: string) => formatDateTime(time)}
        />
        <Table.Column<JobInfo>
          dataIndex="timeEnd"
          title={t(pCommon("timeEnd"))}
          render={(time: string) => formatDateTime(time)}
        />
        {
          showedPrices.map((v, i) => (
            <Table.Column<JobInfo>
              key={i}
              dataIndex={`${v}Price`}
              title={finalPriceText[v]}
              render={(price: Money) => moneyToString(price) + " " + t(pCommon("unit"))}
            />
          ))
        }
        <Table.Column<JobInfo>
          title={t(pCommon("more"))}
          render={(_, r) => <a onClick={() => setPreviewItem(r)}>{t(pCommon("detail"))}</a>}
        />
      </Table>
      <HistoryJobDrawer
        open={previewItem !== undefined}
        item={previewItem}
        onClose={() => setPreviewItem(undefined)}
        showedPrices={showedPrices}
      />
    </>
  );
};
