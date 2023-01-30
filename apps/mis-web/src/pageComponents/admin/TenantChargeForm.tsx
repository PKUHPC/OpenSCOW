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

import { App, Button, Form, Input, InputNumber, Tag } from "antd";
import React, { useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { ClickableA } from "src/components/ClickableA";
import { publicConfig } from "src/utils/config";

import { TenantSelector } from "../tenant/TenantSelector";

interface ChargeFields {
  tenantName: string;
  amount: number;
  comment: string;
  type: string;
}

const getTypes = async () => api.getUsedPayTypes({});

const UsedType: React.FC<{ onClick: (type: string) => void }> = ({ onClick }) => {
  const { isLoading, data } = useAsync({ promiseFn: getTypes });

  const createTag = (x: string) => (
    <Tag key={x} onClick={() => onClick(x)}>
      <ClickableA>{x}</ClickableA>
    </Tag>
  );

  return (
    <div>
      {
        publicConfig.PREDEFINED_CHARGING_TYPES.map(createTag)
      }
      {isLoading
        ? "正在加载使用过的类型……"
        : (data ? data.types.filter((x) => x && !publicConfig.PREDEFINED_CHARGING_TYPES.includes(x)) : [])
          .map(createTag)
      }
    </div>
  );

};

export const TenantChargeForm: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<ChargeFields>();

  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const { tenantName, amount, comment, type } = await form.validateFields();

    setLoading(true);

    const hide = message.loading("充值中……", 0);

    // 2. upload the rest
    await api.tenantFinancePay({
      body: {
        tenantName,
        type,
        amount,
        comment,
      },
    })
      .httpError(404, () => {
        message.error("账户未找到");
      })
      .then(() => {
        message.success("充值完成！");
      })
      .finally(() => {
        setLoading(false);
        hide();
      });

  };

  return (
    <Form
      form={form}
      wrapperCol={{ span: 20 }}
      labelCol={{ span: 4 }}
      labelAlign="right"
      onFinish={submit}
    >
      <Form.Item
        name="tenantName"
        label="租户"
        rules={[{ required: true }]}
      >
        <TenantSelector
          placeholder="选择租户"
          autoSelect
          // onChange={(tenantName) => form.setFieldValue("tenantName", tenantName)}
        />
      </Form.Item>
      <Form.Item name="amount" label="金额" rules={[{ required: true }]}>
        <InputNumber min={0} step={0.01} addonAfter="元" />
      </Form.Item>
      <Form.Item
        name="type"
        label="类型"
        required
        extra={(
          <div style={{ margin: "8px 0" }}>
            <UsedType
              onClick={(type) => form.setFieldsValue({ type })}
            />
          </div>
        )}
      >
        <Input />
      </Form.Item>
      <Form.Item name="comment" label="备注">
        <Input.TextArea />
      </Form.Item>
      <Form.Item wrapperCol={{ span: 6, offset: 4 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};
