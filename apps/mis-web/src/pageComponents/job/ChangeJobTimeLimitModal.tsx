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
import { App, Divider, Form, InputNumber, Modal, Progress } from "antd";
import { useRef, useState } from "react";
import { api } from "src/apis";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { RunningJobInfo } from "src/models/job";
import type { Cluster } from "src/utils/config";

interface Props {
  open: boolean;
  onClose: () => void;
  reload: () => void;

  data: RunningJobInfo[];
}

interface FormProps {
  limitMinutes: number;
}

interface CompletionStatus {
  total: number;
  success: number;
  failed: RunningJobInfo[];

}

const p = prefix("pageComp.job.ChangeJobTimeLimitModal.");
const pCommon = prefix("common.");

export const ChangeJobTimeLimitModal: React.FC<Props> = ({ open, onClose, data, reload }) => {

  const { t } = useI18nTranslateToString();

  const { message } = App.useApp();

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
      title={t(p("modifyLimit"))}
      okText={t(pCommon("modify"))}
      cancelText={t(pCommon("cancel"))}
      onCancel={close}
      confirmLoading={loading}
      destroyOnClose
      onOk={async () => {
        const { limitMinutes } = await form.validateFields();
        setLoading(true);

        completionStatus.current = { total: data.length, success: 0, failed: []};

        await Promise.all(data.map(async (r) => {
          await api.changeJobTimeLimit({ body: { cluster: r.cluster.id, limitMinutes, jobId: r.jobId } })
            .httpError(400, (e) => {
              if (e.code === "TIME_LIME_NOT_VALID") {
                message.error(e.message);
              };
              throw e;
            })
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
                message.success(t(p("success")));
                reload();
                close();
              } else {
                message.error(t(p("fail")));
                reload();
              }
            }
          })
          .finally(() => setLoading(false));

      }}
    >
      <Form form={form} initialValues={{ limitMinutes: 1 }}>
        {
          Array.from(dataGroupedByCluster.entries()).map(([cluster, data]) => (
            <>
              <Form.Item label={t(pCommon("cluster"))}>
                <strong>{cluster.name}</strong>
              </Form.Item>
              <Form.Item label={t(pCommon("userId"))}>
                <strong>{data.map((x) => x.jobId).join(", ")}</strong>
              </Form.Item>
              <Divider />
            </>
          ))
        }
        <Form.Item<FormProps> label={t(p("setLimit"))} rules={[{ required: true }]}>
          <Form.Item name="limitMinutes" noStyle>
            <InputNumber min={1} step={1} addonAfter={t(pCommon("minute"))} />
          </Form.Item>
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
            <Form.Item label={t(p("modifyWork"))}>
              {completionStatus.current!.failed.map((x) => <strong key={x.jobId}>{x.jobId}</strong>)}
            </Form.Item>
          ) : undefined
      }
    </Modal>
  );
};
