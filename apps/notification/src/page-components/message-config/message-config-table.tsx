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

import { useMutation, useQuery } from "@connectrpc/connect-query";
import {
  listMessageConfigs,
  modifyMessageConfigs,
} from "@scow/notification-protos/build/message_config-MessageConfigService_connectquery";
import { Form, message, Table } from "antd";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { NoShadowButton } from "src/components/no-shadow-button";
import { PageTitle } from "src/components/page-title";
import { ScowParamsContext } from "src/components/scow-params-provider";
import { useMessageConfigColumns } from "src/hook/use-message-config-columns";
import { NoticeType } from "src/models/notice-type";
import { getLanguage } from "src/utils/i18n";
import { styled } from "styled-components";

interface StyledTrProps {
  isDark: boolean;
}
// 定义样式组件
const WhiteRow = styled.tr<StyledTrProps>`
  background-color: ${({ isDark }) => isDark ? "#121212" : "#ffffff"};

  &:hover {
    background-color: ${({ isDark }) => isDark ? "#1D262C" : "#E9EDEE"};
  }
`;

const GrayRow = styled.tr<StyledTrProps>`
  background-color: ${({ isDark }) => isDark ? "#1D1D1D" : "#f7f7f7"};

  &:hover {
    background-color: ${({ isDark }) => isDark ? "#1D262C" : "#E9EDEE"};
  }
`;

export interface FormValues {
  noticeConfigs: Record<string, Partial<Record<NoticeType, boolean>>>;
}

export const MessageConfigTable: React.FC = () => {

  const [form] = Form.useForm<FormValues>();
  const { scowLangId, scowDark } = useContext(ScowParamsContext);
  const lang = getLanguage(scowLangId);
  const compLang = lang.messageConfig.messageConfigTable;

  const defaultNoticeTypesCheckValue = useMemo(() => {
    return Object.values(NoticeType)
      .filter((value) => typeof value === "number") // 只保留数值部分
      .reduce((acc, noticeType) => {
        acc[noticeType] = true;
        return acc;
      }, {} as Record<NoticeType, boolean>);
  }, [...Object.values(NoticeType)]);

  const [noticeTypeAllChecked, setNoticeTypeAllChecked]
      = useState<Partial<Record<NoticeType, boolean>>>(defaultNoticeTypesCheckValue);
  const [hasChange, setHasChange] = useState(false);

  const { data, isLoading, refetch } = useQuery(listMessageConfigs);
  const { mutateAsync } = useMutation(modifyMessageConfigs, {
    onError: (err) => message.error(err.message),
    onSuccess: () => {
      message.success(compLang.saveSuccess);
      setHasChange(false);
      refetch();
    },
  });

  const columns = useMessageConfigColumns({
    form, noticeTypeAllChecked, setNoticeTypeAllChecked, setHasChange, lang,
  });

  const handleSave = async () => {
    if (!data) return;
    try {
      const values = form.getFieldsValue();

      const parsedValues = Object.keys(values.noticeConfigs).map((messageType) => {

        const messageConfig = data?.configs.find((config) => config.messageType === messageType);

        if (!messageConfig) {
          message.error(compLang.formError);
          throw Error("Unable to find the corresponding MessageConfig");
        };

        const noticeConfigs = Object.keys(values.noticeConfigs[messageType]).map((noticeType) => {
          const enumNoticeType = Number(noticeType) as unknown as NoticeType;

          const originalNoticeConfig = messageConfig?.noticeConfigs.find(
            (config) => config.noticeType === enumNoticeType);

          if (!originalNoticeConfig) {
            message.error(compLang.formError);
            throw Error("Unable to find the corresponding NoticeType");
          };

          return {
            noticeType: enumNoticeType,
            canUseModify: originalNoticeConfig.canUserModify,
            enabled: values.noticeConfigs[messageType][noticeType]!,
          };
        });

        return {
          ...messageConfig,
          noticeConfigs,
        };
      });

      await mutateAsync({ configs: parsedValues });

    } catch {
      message.error(compLang.saveError);
    }
  };

  useEffect(() => {
    if (data) {
      const initialValues: FormValues = data.configs.reduce((acc, item) => {
        if (!acc.noticeConfigs) acc.noticeConfigs = {};
        acc.noticeConfigs[item.messageType] = {};
        item.noticeConfigs.forEach((config) => {
          if (config.noticeType === undefined) return;
          const noticeType = config.noticeType as number; // 类型断言
          acc.noticeConfigs[item.messageType][noticeType] = config.enabled;
          // 设置对应类型是否全选
          if (!config.enabled) {
            setNoticeTypeAllChecked((prev) => ({
              ...prev,
              [noticeType]: false,
            }));
          }
        });
        return acc;
      }, { noticeConfigs:  {} as Record<string, Partial<Record<NoticeType, boolean>>> }); // 添加显式类型断言

      form.setFieldsValue({ noticeConfigs: initialValues.noticeConfigs });

    }
  }, [form, data]);


  return (
    <div>
      <PageTitle titleText={lang.messageConfig.pageTitle}>
        <NoShadowButton
          disabled={!hasChange}
          onClick={handleSave}
          type="primary"
          shape="round"
          size="large"
        >
          {lang.common.save}
        </NoShadowButton>
      </PageTitle>
      <Form form={form} name="message-config">
        <Table
          bordered
          pagination={false}
          rowKey="messageType"
          loading={isLoading}
          columns={columns}
          dataSource={data?.configs ?? []}
          rowClassName={(_, index) => (index % 2 === 0 ? "white-row" : "gray-row")}
          components={{
            body: {
              row: (props) => {
                const { className, ...restProps } = props;
                // 使用样式组件根据 className 来决定使用哪一个
                if (className.includes("white-row")) {
                  return <WhiteRow isDark={scowDark} {...restProps} />;
                }
                return <GrayRow isDark={scowDark} {...restProps} />;
              },
            },
          }}
        />
      </Form>
    </div>
  );
};
