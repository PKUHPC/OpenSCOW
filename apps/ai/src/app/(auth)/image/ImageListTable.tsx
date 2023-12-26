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

"use client";

import { PlusOutlined } from "@ant-design/icons";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { TRPCClientError } from "@trpc/client";
import { App, Button, Divider, Form, Input, Space, Table } from "antd";
import NextError from "next/error";
import { useState } from "react";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { ModalButton } from "src/components/ModalLink";
import { AppRouter } from "src/server/trpc/router";
import { Cluster } from "src/utils/config";
import { trpc } from "src/utils/trpc";

import { defaultClusterContext } from "../defaultClusterContext";
import { CreateEditImageModal } from "./CreateEditImageModal";


interface Props {
  isPublic: boolean;
  clusters: Cluster[];
}

interface FilterForm {
  cluster?: Cluster | undefined,
  nameOrTagOrDesc?: string | undefined,
  isShared?: boolean,
}

interface PageInfo {
    page: number;
    pageSize?: number;
}

const CreateImageModalButton = ModalButton(CreateEditImageModal, { type: "primary", icon: <PlusOutlined /> });
const EditImageModalButton = ModalButton(CreateEditImageModal, { type: "link" });

export const ImageListTable: React.FC<Props> = ({ isPublic, clusters }) => {

  const { defaultCluster } = defaultClusterContext(clusters);

  const [query, setQuery] = useState<FilterForm>(() => {
    return {
      cluster: defaultCluster,
      nameOrTagOrDesc: undefined,
      isShared: isPublic,
    };
  });

  const [form] = Form.useForm<FilterForm>();
  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: 10 });

  const { data, refetch, isFetching, error } = trpc.image.list.useQuery({
    ...pageInfo, ...query, clusterId: query.cluster?.id,
  });

  const { modal, message } = App.useApp();

  if (error) {
    return (
      <NextError
        title={error.message}
        statusCode={error.data?.httpStatus ?? 500}
      />
    );
  }

  const deleteDatasetMutation = trpc.image.deleteImage.useMutation({
    onError: (err) => {
      const { data } = err as TRPCClientError<AppRouter>;
      if (data?.code === "NOT_FOUND") {
        message.error("找不到该数据集");
      }
    },
  });

  return (
    <div>
      <FilterFormContainer style={{ display: "flex", justifyContent: "space-between" }}>
        <Form<FilterForm>
          layout="inline"
          form={form}
          initialValues={query}
          onFinish={async () => {
            const { nameOrTagOrDesc } = await form.validateFields();
            setQuery({ ...query, nameOrTagOrDesc: nameOrTagOrDesc?.trim() });
            setPageInfo({ page: 1, pageSize: pageInfo.pageSize });
          }}
        >
          <Form.Item label="集群" name="cluster">
            <SingleClusterSelector
              allowClear={true}
            />
          </Form.Item>
          <Form.Item name="nameOrTagOrDesc">
            <Input allowClear placeholder="名称或标签或描述" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">搜索</Button>
          </Form.Item>
        </Form>
        {!isPublic && (
          <Space>
            <CreateImageModalButton
              refetch={refetch}
              isEdit={false}
              clusters={clusters}
            > 添加
            </CreateImageModalButton>
          </Space>
        )}
      </FilterFormContainer>
      <Table
        rowKey="id"
        dataSource={data?.items}
        loading={isFetching}
        columns={[
          { dataIndex: "name", title: "名称" },
          { dataIndex: "clusterId", title: "集群",
            render: (_, r) =>
              getI18nConfigCurrentText(clusters.find((x) => (x.id === r.clusterId))?.name, undefined) ?? r.clusterId },
          { dataIndex: "tags", title: "标签" },
          { dataIndex: "description", title: "镜像描述" },
          // { dataIndex: "sourcePath", title: "镜像地址" },
          isPublic ? { dataIndex: "shareUser", title: "分享者",
            render: (_, r) => r.owner } : {},
          { dataIndex: "createTime", title: "创建时间" },
          { dataIndex: "action", title: "操作",
            render: (_, r) => {
              return !isPublic ?
                (
                  <>
                    <Space split={<Divider type="vertical" />}>
                      <EditImageModalButton refetch={refetch} isEdit={true} editData={r} clusters={clusters}>
                        分享
                      </EditImageModalButton>
                    </Space>
                    <Space split={<Divider type="vertical" />}>
                      <EditImageModalButton refetch={refetch} isEdit={true} editData={r} clusters={clusters}>
                        查看文件
                      </EditImageModalButton>
                    </Space>
                    <Space split={<Divider type="vertical" />}>
                      <EditImageModalButton refetch={refetch} isEdit={true} editData={r} clusters={clusters}>
                        编辑
                      </EditImageModalButton>
                    </Space>
                    <Space split={<Divider type="vertical" />}>
                      <Button
                        type="link"
                        onClick={() => {
                          modal.confirm({
                            title: "删除镜像",
                            content: `是否确认删除镜像${r.name}？如该镜像已分享，则分享的镜像也会被删除。`,
                            onOk: () => {
                              deleteDatasetMutation.mutate({
                                id: r.id,
                              }, {
                                onSuccess() {
                                  refetch();
                                  message.success("删除成功");
                                },
                              });
                            },
                          });
                        }}
                      >
                        删除
                      </Button>
                    </Space>
                  </>
                ) :
                (
                  <Space split={<Divider type="vertical" />}>
                    <EditImageModalButton refetch={refetch} isEdit={true} editData={r} clusters={clusters}>
                      复制
                    </EditImageModalButton>
                  </Space>
                );
            },
          },
        ]}
        pagination={setPageInfo ? {
          current: pageInfo.page,
          defaultPageSize: 10,
          pageSize: pageInfo.pageSize,
          showSizeChanger: true,
          total: data?.count,
          onChange: (page, pageSize) => setPageInfo({ page, pageSize }),
        } : false}
        scroll={{ x: true }}
      />
    </div>
  );
};

