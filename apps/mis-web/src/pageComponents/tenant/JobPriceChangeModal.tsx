import { Form, Input, InputNumber, Modal } from "antd";
import { useState } from "react";
import { api } from "src/apis";
import { useMessage } from "src/layouts/prompts";
import type { GetJobFilter } from "src/pages/api/job/jobInfo";
import { handleClusteropsErrorInUi } from "src/utils/internalError";

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

const text = {
  "account": "租户计费",
  "tenant": "平台计费",
};

export const JobPriceChangeModal: React.FC<Props> = ({ open, onClose, jobCount, filter, target, reload }) => {
  const [form] = Form.useForm<FormProps>();
  const [loading, setLoading] = useState(false);

  const message = useMessage();

  return (
    <Modal
      open={open}
      title={`修改作业${text[target]}`}
      okText={`修改${text[target]}`}
      cancelText="取消"
      onCancel={onClose}
      confirmLoading={loading}
      onOk={async () => {
        const { price, reason } = await form.validateFields();

        setLoading(true);
        await api.changeJobPrice({ body: { ...filter, price, reason, target } })
          .httpError(500, handleClusteropsErrorInUi)
          .then(() => {
            message.success("修改成功");
            reload();
            onClose();
          })
          .finally(() => setLoading(false));

      }}
    >
      <Form form={form}>
        <Form.Item label="作业数量">
          <strong>{jobCount}</strong>
        </Form.Item>
        <Form.Item<FormProps> label={`新作业${text[target]}`} name="price" rules={[{ required: true }]}>
          <InputNumber min={0} step={0.01} addonAfter={"元"} />
        </Form.Item>
        <Form.Item<FormProps> name="reason" label="修改原因" rules={[{ required: true }]}>
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};
