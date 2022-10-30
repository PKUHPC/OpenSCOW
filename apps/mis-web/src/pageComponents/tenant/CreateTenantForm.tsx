import { Form, Input } from "antd";
import React from "react";
export interface CreateTenantFormFields {
  name: string;
}

export const CreateTenantForm: React.FC = () => {

  return (
    <>
      <Form.Item label="姓名" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
    </>
  );
};
