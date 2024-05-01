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
import { App, Button, DatePicker, Form, Input, Select, Spin, Table } from "antd";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { SearchType } from "src/models/User";
import { ExportFileModaLButton } from "src/pageComponents/common/exportFileModal";
import { MAX_EXPORT_COUNT, urlToExport } from "src/pageComponents/file/apis";
import { ChargeInfo } from "src/pages/api/finance/charges";
import { publicConfig } from "src/utils/config";
import { CHARGE_TYPE_OTHERS } from "src/utils/constants";
import { formatMetadataDisplay } from "src/utils/metadata";

import { AccountSelector } from "./AccountSelector";

// ChargeTable 组件的 Props 接口
interface Props {
  accountName?: string;
  showAccountName: boolean;
  showTenantName: boolean;
  isPlatformRecords?: boolean;
  searchType?: SearchType;
}

// 过滤充值记录的表单接口
interface FilterForm {
  name?: string;
  time: [dayjs.Dayjs, dayjs.Dayjs];
  type?: string;
  userIds?: string;
}

// 当前时间的 dayjs 对象
const now = dayjs();

// 国际化函数
const p = prefix("pageComp.finance.chargeTable.");
const pCommon = prefix("common.");

// 将用户 ID 字符串转换为数组的函数
const convertUserIdArray = (userIds: string | undefined) => {
  return userIds ? userIds.split(",").map((id) => id.trim()) : [];
};

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
    type: string | undefined
    userIds: string | undefined}>({
      name: accountName,
      time: [now.subtract(1, "week").startOf("day"), now.endOf("day")],
      type: undefined,
      userIds: undefined,
    });// 查询对象

  // 过滤后的充值类型数组
  const filteredTypes = [...publicConfig.CHARGE_TYPE_LIST, CHARGE_TYPE_OTHERS];

  // 在账户管理下切换不同账户消费记录页面时
  useDidUpdateEffect(() => {
    form.setFieldsValue({
      name: accountName,
      time: [now.subtract(1, "week").startOf("day"), now.endOf("day")],
      type: undefined,
      userIds: undefined,
    });
    setPageInfo({ page: 1, pageSize: pageInfo.pageSize });
    setQuery({
      name: accountName,
      time: [now.subtract(1, "week").startOf("day"), now.endOf("day")],
      type: undefined,
      userIds: undefined,
    });
    setSelectedAccountName(accountName);
  }, [accountName]);

  // 异步获取充值记录的函数
  const recordsPromiseFn = useCallback(async () => {
    const getChargesInfo = await api.getCharges({ query: {
      accountName: query.name,
      startTime: query.time[0].clone().startOf("day").toISOString(),
      endTime: query.time[1].clone().endOf("day").toISOString(),
      type: query.type,
      isPlatformRecords,
      searchType,
      page: pageInfo.page,
      pageSize: pageInfo.pageSize,
    } });
    // 对返回数据进行过滤，筛选出符合搜索结果的userID或userName
    if (query.userIds) {
      getChargesInfo.results = getChargesInfo.results.filter((v) => {
        return v.userId == query.userIds || v.userName == query.userIds;
      });
    }
    return getChargesInfo;
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
        userIds: convertUserIdArray(query.userIds),
      },
    });
  }, [query]);

  // 使用异步 hook 获取充值记录和总数
  const { data: recordsData, isLoading: isRecordsLoading } = useAsync({
    promiseFn: recordsPromiseFn,
  });

  const { data: totalResultData, isLoading: isTotalResultLoading } = useAsync({
    promiseFn: totalResultPromiseFn,
  });

  // 处理充值记录导出的函数
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
          userIds: query.userIds,
        },
      });
    }
  };

  // 导出按钮的选项
  const exportOptions = useMemo(() => {
    const common = [
      { label: t(pCommon("user")), value: "userId" },
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
              const { name, userIds, time, type } = await form.validateFields();
              setQuery({ name: selectedAccountName ?? name, userIds, time, type: selectedType ?? type });
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
            <Form.Item label={t("common.ownerIdOrName")} name="userIds">
              <Input style={{ width: 180 }} placeholder={t("common.ownerIdOrName")} />
            </Form.Item>
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
                {totalResultData?.totalCount ?? 0}
              </strong>
            </Form.Item>
            <Form.Item label={t(pCommon("sum"))}>
              <strong>
                {totalResultData?.totalAmount?.toFixed(2) ?? 0}
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
            total: totalResultData?.totalCount ?? 0,
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
              <Table.Column<ChargeInfo> dataIndex="accountName" title={t(pCommon("account"))} />
            )
          }
          {
            showTenantName && (
              <Table.Column<ChargeInfo> dataIndex="tenantName" title={t("common.tenant")} />
            )
          }

          <Table.Column<ChargeInfo>
            dataIndex="userId"
            title={t(pCommon("user"))}
            width="15%"
            render={(_, r) => r.userId ? (`${r.userId} (${r.userName})`) : ""}
          />
          <Table.Column<ChargeInfo> dataIndex="time" title={t(p("time"))} render={(v) => formatDateTime(v)} />
          <Table.Column<ChargeInfo> dataIndex="amount" title={t(p("amount"))} render={(v) => v.toFixed(2)} />
          <Table.Column<ChargeInfo> dataIndex="type" title={t(pCommon("type"))} />
          <Table.Column<ChargeInfo>
            dataIndex="comment"
            title={t(pCommon("comment"))}
            width="20%"
          />
          {
            publicConfig.JOB_CHARGE_METADATA?.savedFields && (
              <Table.Column<ChargeInfo>
                dataIndex="metadata"
                title={t(pCommon("other"))}
                width="20%"
                render={(v) => {
                  const metadataToDisplay = v ? formatMetadataDisplay(v) : undefined;
                  return getI18nConfigCurrentText(metadataToDisplay, languageId);
                }}
              />
            )
          }
        </Table>
      </Spin>
    </div>

  );
};
