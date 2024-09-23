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

import { useQuery } from "@connectrpc/connect-query";
import { MessageConfig } from "@scow/notification-protos/build/common_pb";
import { listNoticeTypes } from "@scow/notification-protos/build/notice_type-NoticeTypeService_connectquery";
import { Checkbox, Form, FormInstance, TableColumnsType } from "antd";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  CheckAllSpecifiedNoticeType,
  SelectAllProps,
} from "src/components/check-all-specified-notice-type";
import { ModalButton } from "src/components/modal-button";
import { I18nDicType } from "src/models/i18n";
import { NoticeType } from "src/models/notice-type";
import { MessageConfigModal } from "src/page-components/message-config/message-config-modal";
import { FormValues } from "src/page-components/message-config/message-config-table";

interface Props {
  form: FormInstance<FormValues>;
  noticeTypeAllChecked: Partial<Record<NoticeType, boolean>>;
  setNoticeTypeAllChecked: Dispatch<SetStateAction<Partial<Record<NoticeType, boolean>>>>;
  setHasChange: Dispatch<SetStateAction<boolean>>;
  lang: I18nDicType;
}
export function useMessageConfigColumns({
  form, noticeTypeAllChecked, setNoticeTypeAllChecked, setHasChange, lang,
}: Props) {

  const { data } = useQuery(listNoticeTypes);
  const [columns, setColumns] = useState<TableColumnsType<MessageConfig>>([]);
  const compLang = lang.messageConfig.useMessageConfigColumns;

  const handleCheckChange = ({ e, checkedNoticeType }: SelectAllProps) => {
    const values = form.getFieldsValue();
    setHasChange(true);

    const defaultCheckValue = e.target.checked;

    for (const messageType of Object.keys(values.noticeConfigs)) {
      const noticeConfig = Object.keys(values.noticeConfigs[messageType]).find((noticeType) => {
        const enumNoticeType = Number(noticeType) as unknown as NoticeType;
        return enumNoticeType === checkedNoticeType;
      });
      if (noticeConfig && values.noticeConfigs[messageType][noticeConfig] !== defaultCheckValue) {
        setNoticeTypeAllChecked({
          ...noticeTypeAllChecked,
          [checkedNoticeType]: false,
        });
        return;
      }
    };
    setNoticeTypeAllChecked({
      ...noticeTypeAllChecked,
      [checkedNoticeType]: defaultCheckValue,
    });
  };

  const handleCheckAll = ({ e, checkedNoticeType }: SelectAllProps) => {
    const values = form.getFieldsValue();
    setHasChange(true);

    setNoticeTypeAllChecked({
      ...noticeTypeAllChecked,
      [checkedNoticeType]: e.target.checked,
    });

    const parsedValues = {
      noticeConfigs: Object.keys(values.noticeConfigs).reduce((acc, messageType) => {
        const noticeConfigs = Object.keys(values.noticeConfigs[messageType]).reduce((innerAcc, noticeType) => {
          const enumNoticeType = Number(noticeType) as unknown as NoticeType;
          return {
            ...innerAcc,
            [enumNoticeType]: checkedNoticeType === enumNoticeType
              ? e.target.checked
              : values.noticeConfigs[messageType][noticeType],
          };
        }, {} as Partial<Record<NoticeType, boolean>>);

        return {
          ...acc,
          [messageType]: noticeConfigs,
        };
      }, {} as Record<string, Partial<Record<NoticeType, boolean>>>),
    };

    form.setFieldsValue(parsedValues);
  };

  useEffect(() => {
    if (!data) return;

    const columns: TableColumnsType<MessageConfig> = [
      {
        title: lang.common.serialNumber,
        dataIndex: "index",
        key: "index",
        width: 20,
        fixed: "left",
        render: (_, record, index) => index + 1,
      },
      {
        title: compLang.messageType,
        dataIndex: "messageType",
        key: "messageType",
        width: 150,
        fixed: "left",
        render: (_, record) => {
          const template = record.titleTemplate;
          return template ? template.default : record.messageType;
        },
      },
      {
        title: compLang.category,
        dataIndex: "category",
        key: "category",
        render: (_, record) => {
          const template = record.categoryTemplate;
          return template ? template.default : record.category;
        },
      },
      {
        title: compLang.noticeType,
        children: data?.noticeTypes.map((type) => ({
          title: (
            <CheckAllSpecifiedNoticeType
              checked={noticeTypeAllChecked[type] ?? false}
              type={type}
              handleCheckAll={handleCheckAll}
            />
          ),
          dataIndex: type,
          key: type,
          render: (_, record) => {
            return (
              <Form.Item
                name={["noticeConfigs", record.messageType, type]}
                valuePropName="checked"
                noStyle
              >
                <Checkbox onChange={(e) => handleCheckChange({ e, checkedNoticeType: type })} />
              </Form.Item>
            );
          },
        })),
      },
      {
        title: compLang.operation,
        dataIndex: "",
        key: "x",
        render: (_, record) => (
          <MessageConfigModalButton
            // formNoticeConfigs={form.getFieldsValue().noticeConfigs}
            data={record}
            enabledNoticeTypes={data?.noticeTypes ?? []}
            lang={lang}
          >
            {compLang.configuration}
          </MessageConfigModalButton>
        ),
      },
    ];

    setColumns(columns);
  }, [data, ...Object.values(noticeTypeAllChecked)]);

  return columns;
}

const MessageConfigModalButton = ModalButton(MessageConfigModal, { size: "middle" });
