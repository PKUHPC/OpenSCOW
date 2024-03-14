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

import { OperationType } from "@scow/lib-operation-log/build/index";
import { formatDateTime, getDefaultPresets } from "@scow/lib-web/build/utils/datetime";
import { DEFAULT_PAGE_SIZE } from "@scow/lib-web/build/utils/pagination";
import { App, Button, DatePicker, Form, Input, Select, Table } from "antd";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { getI18nCurrentText, prefix, useI18n, useI18nTranslate, useI18nTranslateToString } from "src/i18n";
import {
  getOperationDetail,
  getOperationResultTexts,
  getOperationTypeTexts, OperationCodeMap, OperationLog,
  OperationLogQueryType,
  OperationResult } from "src/models/operationLog";
import { ExportFileModaLButton } from "src/pageComponents/common/exportFileModal";
import { MAX_EXPORT_COUNT, urlToExport } from "src/pageComponents/file/apis";
import { User } from "src/stores/UserStore";
import { styled } from "styled-components";

const WordBreakText = styled.div`
  word-wrap: break-word;
  word-break: break-all;`;

interface FilterForm {
  operatorUserId?: string;
  operationType?: OperationType;
  customEventType?: string
  operationTime?: [dayjs.Dayjs, dayjs.Dayjs],
  operationResult?: OperationResult;
  operationDetail?: string;
}

interface PageInfo {
  page: number;
  pageSize?: number;
}

interface Props {
  user: User;
  queryType: OperationLogQueryType;
  accountName?: string
  tenantName?: string;
}

const today = dayjs().endOf("day");

const p = prefix("component.others.");
const pCommon = prefix("common.");

export const OperationLogTable: React.FC<Props> = ({ user, queryType, accountName, tenantName }) => {

  const t = useI18nTranslateToString();
  const tArgs = useI18nTranslate();
  const languageId = useI18n().currentLanguage.id;

  const OperationResultTexts = getOperationResultTexts(t);
  const OperationTypeTexts = getOperationTypeTexts(t);

  const { message } = App.useApp();

  const [ query, setQuery ] = useState<FilterForm>(() => {
    return {
      operatorUserId: undefined,
      operationType: undefined,
      operationTime: [today.clone().subtract(30, "day"), today],
      operationResult: undefined,
      operationDetail: undefined,
      customEventType: undefined,
    };
  });

  const [form] = Form.useForm<FilterForm>();

  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: DEFAULT_PAGE_SIZE });

  const operationType = Form.useWatch("operationType", form);

  const getOperatorUserIds = () => {
    if (queryType === OperationLogQueryType.USER) {
      return [user.identityId];
    }
    const operatorUserId = query.operatorUserId?.trim();
    return operatorUserId ? [operatorUserId] : [];
  };

  const promiseFn = useCallback(async () => {
    return await api.getOperationLogs({ query: {
      type: queryType,
      operatorUserIds: getOperatorUserIds().join(","),
      operationType: query.operationType,
      operationResult: query.operationResult,
      startTime: query.operationTime?.[0].toISOString(),
      endTime: query.operationTime?.[1].toISOString(),
      operationTargetAccountName: accountName,
      operationDetail: query.operationDetail,
      customEventType: query.customEventType,
      page: pageInfo.page,
      pageSize: pageInfo.pageSize,
    } });
  }, [query, pageInfo, queryType, accountName, tenantName]);

  const { data, isLoading } = useAsync({ promiseFn });

  const getCustomEventTypesPromise = useCallback(async () => {
    return await api.getCustomEventTypes({});
  }, []);

  const { data: customEventTypes, isLoading : customEventTypesLoading } = useAsync({
    promiseFn: getCustomEventTypesPromise,
  });

  const getformatData = (results: OperationLog[] | undefined) => {
    if (!results) {
      return [];
    }
    return results.map((data) => {
      return {
        ...data,
        operationCode: data.operationEvent?.["$case"] ? OperationCodeMap[data.operationEvent?.["$case"]] : "000000",
        operationType: data.operationEvent?.["$case"] || "unknown",
        operationDetail: getOperationDetail(data.operationEvent, t, tArgs, languageId),
      };
    });
  };


  const handleExport = async (columns: string[]) => {
    const total = data?.totalCount ?? 0;
    if (total > MAX_EXPORT_COUNT) {
      message.error(t(pCommon("exportMaxDataErrorMsg"), [MAX_EXPORT_COUNT]));
    } else if (total <= 0) {
      message.error(t(pCommon("exportNoDataErrorMsg")));
    } else {
      window.location.href = urlToExport({
        exportApi: "exportOperationLog",
        columns,
        count: total,
        query: {
          type: queryType,
          operatorUserIds: getOperatorUserIds().join(","),
          operationType: query.operationType,
          customEventType: query.customEventType,
          operationResult: query.operationResult,
          startTime: query.operationTime?.[0].toISOString(),
          endTime: query.operationTime?.[1].toISOString(),
          operationTargetAccountName: accountName,
          operationDetail: query.operationDetail,
          page: pageInfo.page,
          pageSize: pageInfo.pageSize,
        },
      });
    }

  };

  const exportOptions = useMemo(() => {
    return [
      { label:  t(p("operationCode")), value: "operationCode" },
      { label: t(p("operationType")), value: "operationType" },
      { label: t(p("operationDetail")), value: "operationDetail" },
      { label: t(p("operationResult")), value: "operationResult" },
      { label: t(p("operationTime")), value: "operationTime" },
      { label: t(p("operatorUserId")), value: "operatorUserId" },
      { label: t(p("operatorIp")), value: "operatorIp" },
    ];
  }, [t]);


  return (
    <div>
      <FilterFormContainer>
        <Form<FilterForm>
          form={form}
          layout="inline"
          initialValues={query}
          onFinish={async () => {
            const { operationType, operatorUserId,
              operationResult, operationTime, operationDetail, customEventType } = await form.validateFields();
            setQuery({
              operationType, operatorUserId, operationResult,
              operationTime, operationDetail, customEventType,
            });
            setPageInfo({ page: 1, pageSize: pageInfo.pageSize });
          }}
        >
          <Form.Item label={t(p("operationType"))} name="operationType">
            <Select
              showSearch
              options={
                Object.keys(OperationTypeTexts).map((key) => ({ value: key, label: OperationTypeTexts[key] }))
              }
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              allowClear
              style={{ width: 180 }}
            />
          </Form.Item>
          {operationType === "customEvent" && (
            <Form.Item label={t(p("customEventType"))} name="customEventType">
              <Select
                showSearch
                options={
                  customEventTypes?.results?.map((t) => ({
                    label: getI18nCurrentText(t.name, languageId),
                    value: t.type,
                  })) || []
                }
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                allowClear
                style={{ width: 180 }}
                loading={customEventTypesLoading}
              >
              </Select>
            </Form.Item>
          )}
          <Form.Item label={t(p("operationResult"))} name="operationResult">
            <Select
              options={
                Object.keys(OperationResultTexts)
                  .filter((key) => key !== OperationResult.UNKNOWN.toString())
                  .map((key) => ({ value: key, label: OperationResultTexts[key] }))}
              allowClear
              style={{ width: 80 }}
            />
          </Form.Item>
          {queryType !== OperationLogQueryType.USER && (
            <Form.Item label={t(p("operatorUserId"))} name="operatorUserId">
              <Input style={{ width: 150 }} />
            </Form.Item>
          )}
          <Form.Item label={t(p("operationDetail"))} name="operationDetail">
            <Input style={{ width: 150 }} />
          </Form.Item>
          <Form.Item label={t(p("operationTime"))} name="operationTime">
            <DatePicker.RangePicker showTime allowClear={false} presets={getDefaultPresets(languageId)} />
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
      </FilterFormContainer>
      <Table
        dataSource={getformatData(data?.results)}
        loading={isLoading}
        pagination={{
          current: pageInfo.page,
          pageSize: pageInfo.pageSize,
          defaultPageSize: DEFAULT_PAGE_SIZE,
          showSizeChanger: true,
          total: data?.totalCount,
          onChange: (page, pageSize) => setPageInfo({ page, pageSize }),
        }}
      >
        <Table.Column<OperationLog> dataIndex="operationLogId" title="ID" />
        <Table.Column
          dataIndex="operationCode"
          title={t(p("operationCode"))}
        />
        <Table.Column<OperationLog>
          dataIndex="operationType"
          title={t(p("operationType"))}
          render={(operationType, r) => {
            return r.operationEvent.$case === "customEvent"
              ? getI18nCurrentText(r.operationEvent.customEvent.name, languageId)
              : OperationTypeTexts[operationType];
          }
          }
        />
        <Table.Column
          dataIndex="operationDetail"
          title={t(p("operationDetail"))}
          width="30%"
          render={(operationDetail) => (
            <WordBreakText>{operationDetail}</WordBreakText>
          )}
        />
        <Table.Column<OperationLog>
          dataIndex="operationResult"
          title={t(p("operationResult"))}
          render={(operationResult) => OperationResultTexts[operationResult] }
        />
        <Table.Column<OperationLog>
          dataIndex="operationTime"
          title={t(p("operationTime"))}
          render={formatDateTime}
        />
        <Table.Column<OperationLog>
          dataIndex="operatorUserId"
          title={t(p("operatorUserId"))}
          render={(_, r) => (`${r.operatorUserId} (${r.operatorUserName})`)}
        />
        <Table.Column<OperationLog>
          dataIndex="operatorIp"
          title={t(p("operatorIp"))}
          render={(operatorIp) => (
            <WordBreakText>{operatorIp}</WordBreakText>
          )}
        />
      </Table>
    </div>
  );
};
