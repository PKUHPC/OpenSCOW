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

import { formatDateTime, getDefaultPresets } from "@scow/lib-web/build/utils/datetime";
import { JobInfo } from "@scow/protos/build/common/ended_job";
import { Money } from "@scow/protos/build/common/money";
import { Static } from "@sinclair/typebox";
import { Button, DatePicker, Divider, Form, Input, InputNumber, Space, Table } from "antd";
import dayjs from "dayjs";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { ClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer, FilterFormTabs } from "src/components/FilterFormContainer";
import { TableTitle } from "src/components/TableTitle";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { HistoryJobDrawer } from "src/pageComponents/job/HistoryJobDrawer";
import { JobPriceChangeModal } from "src/pageComponents/tenant/JobPriceChangeModal";
import type { GetJobFilter, GetJobInfoSchema } from "src/pages/api/job/jobInfo";
import type { Cluster } from "src/utils/config";
import { getClusterName, publicConfig } from "src/utils/config";
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

const p = prefix("pageComp.tenant.adminJobTable.");
const pCommon = prefix("common.");

const filterFormToQuery = (query: FilterForm, rangeSearch: boolean): GetJobFilter => {
  return {
    userId: rangeSearch ? (query.userId || undefined) : undefined,
    accountName: rangeSearch ? (query.accountName || undefined) : undefined,
    jobEndTimeStart: rangeSearch ? (query.jobEndTime[0].toISOString()) : undefined,
    jobEndTimeEnd: rangeSearch ? (query.jobEndTime[1].toISOString()) : undefined,
    jobId:  !rangeSearch ? (query.jobId || undefined) : undefined,
    clusters: query.clusters?.map((x) => x.id),
  };
};

export const AdminJobTable: React.FC<Props> = () => {

  const { t } = useI18nTranslateToString();
  const languageId = useI18n().currentLanguage.id;

  const rangeSearch = useRef(true);

  const [query, setQuery] = useState<FilterForm>(() => {
    const now = dayjs();
    return {
      jobId: undefined,
      userId: "",
      accountName: "",
      jobEndTime: [now.subtract(1, "week").startOf("day"), now.endOf("day")],
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
            const currentQuery = await form.validateFields();
            setQuery(currentQuery);
            setPageInfo({ page: 1, pageSize: pageInfo.pageSize });
          }}
        >
          <FilterFormTabs
            button={(
              <Form.Item>
                <Button type="primary" htmlType="submit">{t(pCommon("search"))}</Button>
              </Form.Item>
            )}
            onChange={(a) => rangeSearch.current = a === "range"}
            tabs={[
              {
                title: t(p("batch")), key: "range", node: (
                  <>
                    <Form.Item label={t(pCommon("cluster"))} name="clusters">
                      <ClusterSelector />
                    </Form.Item>
                    <Form.Item label={t(pCommon("userId"))} name="userId">
                      <Input />
                    </Form.Item>
                    <Form.Item label={t(pCommon("account"))} name="accountName">
                      <Input />
                    </Form.Item>
                    <Form.Item label={t(pCommon("timeEnd"))} name="jobEndTime">
                      <DatePicker.RangePicker showTime allowClear={false} presets={getDefaultPresets(languageId)} />
                    </Form.Item>
                  </>
                ),
              },
              {
                title: t(p("precise")), key: "precision", node: (
                  <>
                    <Form.Item label={t(pCommon("cluster"))} name="clusters">
                      <ClusterSelector />
                    </Form.Item>
                    <Form.Item label={t(pCommon("clusterWorkId"))} name="jobId">
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

  const { t } = useI18nTranslateToString();

  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        {t(p("adjust"))}{target === "account" ? t(p("tenantPrice")) : t(p("platformPrice"))}
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
  data: Static<typeof GetJobInfoSchema["responses"]["200"]> | undefined;
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

  const { t } = useI18nTranslateToString();
  const languageId = useI18n().currentLanguage.id;

  const [previewItem, setPreviewItem] = useState<JobInfo | undefined>(undefined);

  return (
    <>
      <TableTitle justify="space-between">
        {
          data ? (
            <div>
              <span>
                {t(p("jobNumber"))}<strong>{data.totalCount}</strong>
              </span>
              <Divider type="vertical" />
              <span>
                {t(p("tenantPriceSum"))}
                <strong>{nullableMoneyToString(data.totalAccountPrice)} {t(pCommon("unit"))}</strong>
              </span>
              <Divider type="vertical" />
              <span>
                {t(p("platformPriceSum"))}
                <strong>{nullableMoneyToString(data.totalTenantPrice)} {t(pCommon("unit"))}</strong>
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
        <Table.Column<JobInfo> dataIndex="idJob" title="集群作业ID" />
        <Table.Column<JobInfo> dataIndex="account" title="账户" />
        <Table.Column<JobInfo> dataIndex="user" title="用户" />
        <Table.Column<JobInfo>
          dataIndex="cluster"
          title={t(pCommon("cluster"))}
          render={(cluster) => getClusterName(cluster, languageId)}
        />
        <Table.Column<JobInfo> dataIndex="partition" title={t(pCommon("partition"))} />
        <Table.Column<JobInfo> dataIndex="qos" title="QOS" />
        <Table.Column<JobInfo> dataIndex="jobName" title={t(pCommon("workName"))} />
        <Table.Column<JobInfo>
          dataIndex="timeSubmit"
          title={t(pCommon("timeSubmit"))}
          render={(time: string) => formatDateTime(time)}
        />
        <Table.Column<JobInfo>
          dataIndex="timeEnd"
          title={t(pCommon("timeEnd"))}
          render={(time: string) => formatDateTime(time)}
        />
        <Table.Column<JobInfo>
          dataIndex="accountPrice"
          title={t(p("tenantPrice"))}
          render={(price: Money) => moneyToString(price)}
        />
        <Table.Column<JobInfo>
          dataIndex="tenantPrice"
          title={t(p("platformPrice"))}
          render={(price: Money) => moneyToString(price)}
        />
        <Table.Column<JobInfo>
          title={t(pCommon("more"))}
          render={(_, r) => <a onClick={() => setPreviewItem(r)}>{t(pCommon("detail"))}</a>}
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
