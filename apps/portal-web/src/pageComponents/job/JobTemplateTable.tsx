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

import { JobTemplateInfo } from "@scow/protos/build/portal/job";
import { App, Button, Form, Input, Modal, Popconfirm, Space, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import Link from "next/link";
import React, { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";
import type { Cluster } from "src/utils/config";

interface Props {}

interface FilterForm {
  cluster: Cluster;
}

interface FormProps {
  jobName: string;
}

interface ModalProps {
  open: boolean;
  cluster: string;
  templateId: string;
  close: () => void;
  reload: () => void;
}

export const JobTemplateTable: React.FC<Props> = () => {

  const defaultClusterStore = useStore(DefaultClusterStore);

  const [query, setQuery] = useState<FilterForm>(() => {
    return {
      cluster: defaultClusterStore.cluster,
    };
  });

  const [form] = Form.useForm<FilterForm>();

  const promiseFn = useCallback(async () => {
    return await api.listJobTemplates({ query: {
      cluster: query.cluster.id,
    } }).then((x) => x.results);
  }, [query.cluster]);

  const { data, isLoading, reload } = useAsync({ promiseFn });

  return (
    <div>
      <FilterFormContainer>
        <Form<FilterForm>
          layout="inline"
          form={form}
          initialValues={query}
          onFinish={async () => {
            setQuery({
              ...(await form.validateFields()),
            });
          }}
        >
          <Form.Item label="集群" name="cluster">
            <SingleClusterSelector />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">搜索</Button>
              <Button loading={isLoading} onClick={reload}>刷新</Button>
            </Space>
          </Form.Item>
        </Form>
      </FilterFormContainer>
      <InfoTable
        data={data}
        isLoading={isLoading}
        cluster={query.cluster}
        reload={reload}
      />
    </div>
  );
};

const NewTemplateNameModal: React.FC<ModalProps> = ({
  open, close, reload, cluster, templateId,
}) => {

  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormProps>();

  const onOk = async () => {
    const { jobName } = await form.validateFields();
    setLoading(true);

    await api.renameJobTemplate({ body: {
      cluster,
      templateId,
      jobName,
    } })
      .httpError(404, () => {
        message.error("模板不存在！");
      })
      .then(() => {
        message.success("修改成功！");
        reload();
        close();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal
      title="修改模板名字"
      open={open}
      onCancel={close}
      onOk={onOk}
      confirmLoading={loading}
    >
      <Form form={form}>
        <Form.Item name="jobName" rules={[{ required: true }]} label="新模板名">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};


interface InfoTableProps {
  data?: JobTemplateInfo[];
  isLoading: boolean;
  cluster: Cluster;
  reload: () => void;
}

const InfoTable: React.FC<InfoTableProps> = ({
  data, isLoading, cluster, reload,
}) => {
  const { message } = App.useApp();
  const [modalShow, setModalShow] = useState(false);
  const [templateId, setTemplateId] = useState("");

  const columns: ColumnsType<JobTemplateInfo> = [
    {
      dataIndex: "jobName",
      title: "模板名",
    },
    {
      dataIndex: "comment",
      title: "备注",
    },
    {
      dataIndex: "action",
      title: "操作",
      render:(_, r) => (
        <Space>
          <Link href={{
            pathname: "/jobs/submit",
            query: {
              cluster: cluster.id,
              jobTemplateId: r.id,
            },
          }}
          >
            使用模板
          </Link>
          <Popconfirm
            title="确定删除这个模板吗？"
            onConfirm={async () =>
              api.deleteJobTemplate({
                query: {
                  cluster: cluster.id,
                  templateId: r.id,
                },
              })
                .httpError(404, () => {
                  message.error("模板不存在！");
                })
                .then(() => {
                  message.success("模板已删除！");
                  reload();
                })
            }
          >
            <a>删除</a>
          </Popconfirm>
          <a onClick={() => { setTemplateId(r.id); setModalShow(true); }}>重命名</a>
        </Space>
      ),
    },
  ];

  return (
    <>
      <NewTemplateNameModal
        cluster={cluster.id}
        templateId={templateId}
        close={() => setModalShow(false)}
        open={modalShow}
        reload={reload}
      />
      <Table
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={{ showSizeChanger: true }}
        rowKey={(x) => x.jobName}
        scroll={{ x: true }}
      />
    </>
  );
};


