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

import { arrayContainsElement } from "@scow/lib-web/build/utils/array";
import { Divider, Form, Input, InputNumber, Modal, Progress, Select } from "antd";
import { useRef, useState } from "react";
import { api } from "src/apis";
import { useMessage } from "src/layouts/prompts";
import { RunningJobInfo } from "src/models/job";
import { ChangeStorageMode } from "src/pages/api/admin/changeStorage";
import type { Cluster } from "src/utils/config";

interface Props {
  open: boolean;
  onClose: () => void;
  reload: () => void;

  data: RunningJobInfo[];
}

const changeModeText = {
  INCREASE: "增加",
  DECREASE: "减少",
};

interface FormProps {
  mode: ChangeStorageMode;
  value: number;
}

interface CompletionStatus {
  total: number;
  success: number;
  failed: RunningJobInfo[];
}

export const ChangeJobTimeLimitModal: React.FC<Props> = ({ open, onClose, data, reload }) => {

  const message = useMessage();

  const [form] = Form.useForm<FormProps>();
  const [loading, setLoading] = useState(false);

  const completionStatus = useRef<CompletionStatus | undefined>(undefined);

  const dataGroupedByCluster = data.reduce((prev, curr) => {
    if (!prev.has(curr.cluster)) {
      prev.set(curr.cluster, []);
    }
    prev.get(curr.cluster)!.push(curr);
    return prev;
  }, new Map<Cluster, RunningJobInfo[]>());

  const close = () => {
    completionStatus.current = undefined;
    onClose();
  };

  return (
    <Modal
      open={open}
      title="修改作业时限"
      okText="修改"
      cancelText="取消"
      onCancel={close}
      confirmLoading={loading}
      destroyOnClose
      onOk={async () => {
        const { mode, value } = await form.validateFields();
        setLoading(true);

        const delta = mode === "DECREASE" ? -value : value;

        completionStatus.current = { total: data.length, success: 0, failed: []};

        await Promise.all(data.map(async (r) => {
          await api.changeJobTimeLimit({ body: { cluster: r.cluster.id, delta, jobId: r.jobId } })
            .then(() => {
              if (completionStatus.current) {
                completionStatus.current.success++;
              }
            }).catch(() => {
              if (completionStatus.current) {
                completionStatus.current.failed.push(r);
              }
            });
        }))
          .then(() => {
            if (completionStatus.current) {
              if (completionStatus.current.failed.length === 0) {
                message.success("修改时限全部成功完成。");
                reload();
                close();
              } else {
                message.error("部分作业修改时限失败。");
                reload();
              }
            }
          })
          .finally(() => setLoading(false));


      }}
    >
      <Form form={form} initialValues={{ mode: "INCREASE", value: 1 }}>
        {
          Array.from(dataGroupedByCluster.entries()).map(([cluster, data]) => (
            <>
              <Form.Item label="集群">
                <strong>{cluster.name}</strong>
              </Form.Item>
              <Form.Item label="作业ID">
                <strong>{data.map((x) => x.jobId).join(", ")}</strong>
              </Form.Item>
              <Divider />
            </>
          ))
        }
        <Form.Item<FormProps> label="时间变化" rules={[{ required: true }]}>
          <Input.Group compact>
            <Form.Item name="mode" noStyle>
              <Select placeholder="选择设置为">
                {Object.entries(changeModeText).map(([key, value]) => (
                  <Select.Option value={key} key={key}>{value}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="value" noStyle>
              <InputNumber min={1} step={1} addonAfter={"分钟"} />
            </Form.Item>
          </Input.Group>
        </Form.Item>
      </Form>
      {
        completionStatus.current
          ? (
            ((curr: CompletionStatus) => (
              <Progress
                percent={(curr.success + curr.failed.length) / curr.total * 100}
                success={{ percent: curr.success / curr.total * 100 }}
                format={() => `${curr.success} / ${curr.total}`}
              />
            ))(completionStatus.current)
          ) : (
            <Progress
              percent={0}
              success={{ percent: 0 }}
              format={() => `0/${data.length}`}
            />
          )
      }
      {
        arrayContainsElement(completionStatus?.current?.failed)
          ? (
            <Form.Item label="修改失败的作业">
              {completionStatus.current!.failed.map((x) => <strong key={x.jobId}>{x.jobId}</strong>)}
            </Form.Item>
          ) : undefined
      }
    </Modal>
  );
};
