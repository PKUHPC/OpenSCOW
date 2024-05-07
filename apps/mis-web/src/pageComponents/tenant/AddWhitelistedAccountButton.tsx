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

import { PlusOutlined } from "@ant-design/icons";
import { App, Button, DatePicker, Flex, Form, Input, Modal, Select } from "antd";
import dayjs from "dayjs";
import React, { useState } from "react";
import { api } from "src/apis";
import { prefix, useI18nTranslateToString } from "src/i18n";

interface FormProps {
  accountName: string;
  comment: string;
  indate: string;
  expirationDate: dayjs.Dayjs
}

interface ModalProps {
  open: boolean;
  close: () => void;
  refresh: () => void;
}

const p = prefix("pageComp.tenant.addWhitelistedAccountButton.");
const pCommon = prefix("common.");

const NewAccountModal: React.FC<ModalProps> = ({
  open, close, refresh,
}) => {

  const t = useI18nTranslateToString();

  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormProps>();
  const [selectedOption, setSelectedOption] = useState<string>("custom"); // 添加状态来跟踪选择的选项


  const options = [ // 定义 Select 选项数组，使用国际化函数 t() 翻译每个选项的 label
    { value: "custom", label: t(p("custom")) },
    { value: "oneWeek", label: t(p("oneWeek")) },
    { value: "oneMonth", label: t(p("oneMonth")) },
    { value: "oneYear", label: t(p("oneYear")) },
    { value: "permanent", label: t(p("permanent")) },
  ];

  // 定义规范时间
  const dateFormat = "YYYY-MM-DD";
  // dateRange的时间
  const [expirationDate, setExpirationDate] = useState<dayjs.Dayjs>(dayjs());

  // 对dateRange时间根据options选项进行处理
  React.useEffect(() => {
    let newDate: dayjs.Dayjs;
    switch (selectedOption) {
    case "oneWeek":
      newDate = dayjs().add(1, "week");
      break;

    case "oneMonth":
      newDate = dayjs().add(1, "month");
      break;

    case "oneYear":
      newDate = dayjs().add(1, "year");
      break;

    case "permanent":
      newDate = dayjs("2099-12-31");
      break;

    case "custom":
      newDate = expirationDate.isValid() ? expirationDate : dayjs();
      break;

    default:
      newDate = dayjs();
      break;
    }
    setExpirationDate(newDate); // 更新组件状态
    form.setFieldsValue({ expirationDate: newDate });
  }, [selectedOption]);



  const onOk = async () => {
    const { accountName, indate, expirationDate, comment } = await form.validateFields();
    await api.whitelistAccount({ body: { accountName: accountName.trim(), comment,
      expirationDate:expirationDate.toISOString() } })
      .httpError(404, () => {
        message.error(t(p("notExist")));
      })
      .then(() => {
        message.success(t(p("addSuccess")));
        refresh();
        close();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal
      title={t(p("addWhiteList"))}
      open={open}
      onCancel={close}
      onOk={onOk}
      confirmLoading={loading}
    >
      <Form form={form}>
        <Form.Item name="accountName" rules={[{ required: true }]} label={t(pCommon("accountName"))}>
          <Input />
        </Form.Item>
        {/* 日期选择 */}
        <Flex justify='space-between'>
          <Form.Item
            name="indate"
            label={t(pCommon("indate"))}
            rules={[{ required: true }]}
          >
            <Select
              defaultValue={options[0].value}
              options={options}
              onChange={(value) => setSelectedOption(value)} // 更新选择
            />
          </Form.Item>
          <Form.Item
            name="expirationDate"
            rules={[{ required: selectedOption === "custom", message:"请输入有效期" }]}
            style={{ width: "60%" }}
          >
            {/*  根据选项禁用或启用 DatePicker */}
            <DatePicker
              disabled={selectedOption !== "custom"}
              minDate={dayjs(dayjs().format(dateFormat))}
              value={ expirationDate }
              onChange={(date) => setExpirationDate(date)} // 更新状态
            />
          </Form.Item>
        </Flex>
        <Form.Item name="comment" rules={[{ required: true }]} label={t(pCommon("comment"))}>
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

interface Props {
  refresh: () => void;
}



export const AddWhitelistedAccountButton: React.FC<Props> = ({ refresh }) => {

  const [modalShow, setModalShow] = useState(false);

  const t = useI18nTranslateToString();



  return (
    <>
      <NewAccountModal close={() => setModalShow(false)} open={modalShow} refresh={refresh} />
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalShow(true)}>
        {t(p("addWhiteList"))}
      </Button>
    </>
  );
};
