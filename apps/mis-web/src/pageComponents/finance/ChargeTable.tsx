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
import { useDidUpdateEffect } from "@scow/lib-web/build/utils/hooks";
import { DEFAULT_PAGE_SIZE } from "@scow/lib-web/build/utils/pagination";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { App, Button, DatePicker, Form, Select, Spin, Table } from "antd";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { SearchType } from "src/models/User";
import { ExportFileModaLButton } from "src/pageComponents/common/exportFileModal";
import { MAX_EXPORT_COUNT, urlToExport } from "src/pageComponents/file/apis";
import { publicConfig } from "src/utils/config";
import { CHARGE_TYPE_OTHERS } from "src/utils/constants";
import { formatMetadataDisplay } from "src/utils/metadata";

import { AccountSelector } from "./AccountSelector";

interface Props {
  accountName?: string;
  showAccountName: boolean;
  showTenantName: boolean;
  isPlatformRecords?: boolean;
  searchType?: SearchType;
}

interface FilterForm {
  name?: string;
  time: [dayjs.Dayjs, dayjs.Dayjs];
  type?: string;
}

const now = dayjs();

const p = prefix("pageComp.finance.chargeTable.");
const pCommon = prefix("common.");

export const ChargeTable: React.FC<Props> = ({
  accountName, showAccountName, showTenantName, isPlatformRecords, searchType }) => {
  const t = useI18nTranslateToString();
  const languageId = useI18n().currentLanguage.id;
  const [pageInfo, setPageInfo] = useState({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
  const [selectedAccountName, setSelectedAccountName] = useState<string | undefined>(accountName);
  const [selectedType, setSelectedType] = useState<typeof filteredTypes[number] | undefined>(undefined);

  const { message } = App.useApp();
  const [form] = Form.useForm<FilterForm>();
  const [query, setQuery] = useState<{
    name: string | undefined,
    time: [ dayjs.Dayjs, dayjs.Dayjs ]
    type: string | undefined}>({
      name: accountName,
      time: [now.subtract(1, "week").startOf("day"), now.endOf("day")],
      type: undefined,
    });

  const filteredTypes = [...publicConfig.CHARGE_TYPE_LIST, CHARGE_TYPE_OTHERS];

  // 在账户管理下切换不同账户消费记录页面时
  useDidUpdateEffect(() => {
    form.setFieldsValue({
      name: accountName,
      time: [now.subtract(1, "week").startOf("day"), now.endOf("day")],
      type: undefined,
    });
    setPageInfo({ page: 1, pageSize: pageInfo.pageSize });
    setQuery({
      name: accountName,
      time: [now.subtract(1, "week").startOf("day"), now.endOf("day")],
      type: undefined,
    });
    setSelectedAccountName(accountName);
  }, [accountName]);

  const recordsPromiseFn = useCallback(async () => {
    return await api.getCharges({ query: {
      accountName: query.name,
      startTime: query.time[0].clone().startOf("day").toISOString(),
      endTime: query.time[1].clone().endOf("day").toISOString(),
      type: query.type,
      isPlatformRecords,
      searchType,
      page: pageInfo.page,
      pageSize: pageInfo.pageSize,
    } });
  }, [query, pageInfo]);

  const totalResultPromiseFn = useCallback(async () => {
    return await api.getChargeRecordsTotalCount({
      query: {
        accountName: query.name,
        startTime: query.time[0].clone().startOf("day").toISOString(),
        endTime: query.time[1].clone().endOf("day").toISOString(),
        type: query.type,
        isPlatformRecords,
        searchType,
      },
    });
  }, [query]);

  const { data: recordsData, isLoading: isRecordsLoading } = useAsync({
    promiseFn: recordsPromiseFn,
  });

  const { data: totalResultData, isLoading: isTotalResultLoading } = useAsync({
    promiseFn: totalResultPromiseFn,
  });



  const handleExport = async (columns: string[]) => {
    const totalCount = totalResultData?.totalCount ?? 0;
    if (totalCount > MAX_EXPORT_COUNT) {
      message.error(t(pCommon("exportMaxDataErrorMsg"), [MAX_EXPORT_COUNT]));
    } else if (totalCount <= 0) {
      message.error(t(pCommon("exportNoDataErrorMsg")));
    } else {
      window.location.href = urlToExport({
        exportApi: "exportChargeRecord",
        columns,
        count: totalCount,
        query: {
          startTime: query.time[0].clone().startOf("day").toISOString(),
          endTime: query.time[1].clone().endOf("day").toISOString(),
          accountName: query.name,
          type: query.type,
          searchType: searchType,
          isPlatformRecords: !!isPlatformRecords,
        },
      });
    }
  };

  const exportOptions = useMemo(() => {
    const common = [
      { label: t(p("time")), value: "time" },
      { label: t(p("amount")), value: "amount" },
      { label: t(pCommon("type")), value: "type" },
      { label: t(pCommon("comment")), value: "comment" },
    ];
    const account = showAccountName ? [
      { label: t(pCommon("account")), value: "accountName" },
    ] : [];
    const tenant = showTenantName ? [
      { label: t(pCommon("tenant")), value: "tenantName" },
    ] : [];
    return [...account, ...tenant, ...common];
  }, [showAccountName, showTenantName, t]);

  return (
    <div>
      <Spin spinning={isRecordsLoading || isTotalResultLoading }>
        <FilterFormContainer>
          <Form<FilterForm>
            layout="inline"
            form={form}
            initialValues={query}
            onFinish={async () => {
              const { name, time, type } = await form.validateFields();
              setQuery({ name: selectedAccountName ?? name, time, type: selectedType ?? type });
              setPageInfo({ page: 1, pageSize: pageInfo.pageSize });
            }}
          >
            {
              showAccountName && (
                <Form.Item label={t("common.account")} name="name">
                  <AccountSelector
                    onChange={(value) => {
                      setSelectedAccountName(value);
                    }}
                    placeholder={t("common.selectAccount")}
                    fromAllTenants={showTenantName ? true : false}
                  />
                </Form.Item>
              )
            }
            <Form.Item label={t(pCommon("time"))} name="time">
              <DatePicker.RangePicker allowClear={false} presets={getDefaultPresets(languageId)} />
            </Form.Item>
            <Form.Item label={t("common.type")} name="type">
              <Select
                style={{ minWidth: "100px" }}
                allowClear
                onChange={(value) => {
                  setSelectedType(value);
                }}
                placeholder={t("common.selectType")}
              >
                {(filteredTypes).map((x) => (
                  <Select.Option key={x} value={x}>
                    {x}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={t("common.total")}>
              <strong>
                {totalResultData ? totalResultData.totalCount : 0}
              </strong>
            </Form.Item>
            <Form.Item label={t(pCommon("sum"))}>
              <strong>
                {totalResultData ? totalResultData.totalAmount.toFixed(3) : 0}
              </strong>
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
          tableLayout="fixed"
          dataSource={recordsData?.results}
          pagination={{
            showSizeChanger: true,
            current: pageInfo.page,
            pageSize: pageInfo.pageSize,
            defaultPageSize: DEFAULT_PAGE_SIZE,
            total: totalResultData?.totalCount,
            onChange: (page, pageSize) => {
              // 页码切换时让页面显示的值为上一次query的查询条件
              form.setFieldsValue({
                name: query.name,
                time: query.time,
                type: query.type,
              });
              setPageInfo({ page, pageSize });
            },
          }}
        >
          {
            showAccountName && (
              <Table.Column dataIndex="accountName" title={t(pCommon("account"))} />
            )
          }
          {
            showTenantName && (
              <Table.Column dataIndex="tenantName" title={t("common.tenant")} />
            )
          }
          {/* ui样式确认中 */}
          {/* <Table.Column dataIndex="userId" title={t(pCommon("user"))} /> */}
          <Table.Column dataIndex="time" title={t(p("time"))} render={(v) => formatDateTime(v)} />
          <Table.Column dataIndex="amount" title={t(p("amount"))} render={(v) => v.toFixed(3)} />
          <Table.Column dataIndex="type" title={t(pCommon("type"))} width="15%" />
          <Table.Column dataIndex="comment" title={t(pCommon("comment"))} width="25%" />
          {
            publicConfig.JOB_CHARGE_METADATA?.savedFields && (
              <Table.Column
                dataIndex="metadata"
                title={t(pCommon("other"))}
                width="25%"
                render={(v) => {
                  const metadataToDispaly = v ? formatMetadataDisplay(v?.metadataValue) : undefined;
                  return getI18nConfigCurrentText(metadataToDispaly, languageId);
                }}
              />
            )
          }
        </Table>
      </Spin>
    </div>

  );
};
