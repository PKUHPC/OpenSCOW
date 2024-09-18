/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { App, Form, Input, InputNumber, Modal } from "antd";
import { useState } from "react";
import { api } from "src/apis";
import { prefix, useI18nTranslateToString } from "src/i18n";
import type { GetJobFilter } from "src/pages/api/job/jobInfo";

interface Props {
  open: boolean;
  onClose: () => void;
  jobCount: number;
  filter: GetJobFilter;
  reload: () => void;
  target: "account" | "tenant";
}

interface FormProps {
  price: number;
  reason: string;
}

const p = prefix("pageComp.tenant.jobPriceChangeModal.");
const pCommon = prefix("common.");



export const JobPriceChangeModal: React.FC<Props> = ({ open, onClose, jobCount, filter, target, reload }) => {

  const t = useI18nTranslateToString();

  const [form] = Form.useForm<FormProps>();
  const [loading, setLoading] = useState(false);

  const { message } = App.useApp();

  const text = {
    "account": t(p("tenantPrice")),
    "tenant": t(p("platformPrice")),
  };

  return (
    <Modal
      open={open}
      title={`${t(p("changeJob"))}${text[target]}`}
      okText={`${t(p("modifyButton"))}${text[target]}`}
      cancelText={t(pCommon("cancel"))}
      onCancel={onClose}
      confirmLoading={loading}
      onOk={async () => {
        const { price, reason } = await form.validateFields();

        setLoading(true);
        await api.changeJobPrice({ body: { ...filter, price, reason, target } })
          .then(() => {
            message.success(t(pCommon("changeSuccess")));
            reload();
            onClose();
          })
          .finally(() => setLoading(false));

      }}
    >
      <Form form={form}>
        <Form.Item label={t(p("jobNumber"))}>
          <strong>{jobCount}</strong>
        </Form.Item>
        <Form.Item label={`${t(p("newJob"))}${text[target]}`} name="price" rules={[{ required: true }]}>
          <InputNumber min={0} step={0.01} addonAfter={t(pCommon("unit"))} />
        </Form.Item>
        <Form.Item name="reason" label={t(p("reason"))} rules={[{ required: true }]}>
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};
