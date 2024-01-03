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
import { App, Button, Checkbox, Divider, Form, Input, Space, Table } from "antd";
import NextError from "next/error";
import { useRef, useState } from "react";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { ModalButton } from "src/components/ModalLink";
import { Source, SourceText } from "src/models/Image";
import { AppRouter } from "src/server/trpc/router";
import { Cluster } from "src/utils/config";
import { formatDateTime } from "src/utils/datetime";
import { trpc } from "src/utils/trpc";

import { CopyImageModal } from "./CopyImageModal";
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
const CopyImageModalButton = ModalButton(CopyImageModal, { type: "link" });

export const ImageListTable: React.FC<Props> = ({ isPublic, clusters }) => {

  const [query, setQuery] = useState<FilterForm>(() => {
    return {
      cluster: undefined,
      nameOrTagOrDesc: undefined,
      isPublic: isPublic,
    };
  });

  const [form] = Form.useForm<FilterForm>();
  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: 10 });

  const cluster = Form.useWatch("cluster", form);

  const { data, refetch, isFetching, error } = trpc.image.list.useQuery({
    ...pageInfo, ...query, clusterId: cluster?.id,
  });

  const deleteSourceFileRef = useRef(false);

  const { modal, message } = App.useApp();

  if (error) {
    return (
      <NextError
        title={error.message}
        statusCode={error.data?.httpStatus ?? 500}
      />
    );
  }

  const deleteImageMutation = trpc.image.deleteImage.useMutation({
    onError: (err) => {
      const { data } = err as TRPCClientError<AppRouter>;
      if (data?.code === "NOT_FOUND") {
        message.error("找不到镜像");
      } else {
        message.error("删除镜像失败");
      }
    },
  });

  const shareOrUnshareMutation = trpc.image.shareOrUnshareImage.useMutation({
    onError: (err) => {
      const { data } = err as TRPCClientError<AppRouter>;
      if (data?.code === "NOT_FOUND") {
        message.error("找不到镜像");
      } else {
        message.error("分享镜像失败");
      }
    },
  });

  const deleteSourceFileMutation = trpc.file.deleteItem.useMutation();

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
            refetch();
          }}
        >
          <Form.Item label="集群" name="cluster">
            <SingleClusterSelector
              allowClear={true}
              value={undefined}
            />
          </Form.Item>
          <Form.Item name="nameOrTagOrDesc">
            <Input allowClear placeholder="名称、标签或描述" />
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
          { dataIndex: "tag", title: "标签" },
          { dataIndex: "source", title: "镜像来源",
            render: (_, r) => SourceText[r.source] },
          { dataIndex: "description", title: "镜像描述" },
          // { dataIndex: "sourcePath", title: "镜像地址" },
          isPublic ? { dataIndex: "shareUser", title: "分享者",
            render: (_, r) => r.owner } : {},
          { dataIndex: "createTime", title: "创建时间",
            render: (_, r) => formatDateTime(r.createTime) },
          { dataIndex: "action", title: "操作",
            render: (_, r) => {
              const shareOrUnshareStr = r.isShared ? "取消分享" : "分享";
              return !isPublic ?
                (
                  <>
                    <Space split={<Divider type="vertical" />}>
                      <Button
                        type="link"
                        onClick={() => {

                          modal.confirm({
                            title: `${shareOrUnshareStr}镜像`,
                            content: `确认${shareOrUnshareStr}镜像${r.name}${r.tag}？`,
                            onOk: async () => {
                              await shareOrUnshareMutation.mutateAsync({
                                id: r.id,
                                share: !r.isShared,
                              }, {
                                onSuccess() {
                                  refetch();
                                  message.success(`${shareOrUnshareStr}镜像成功`);
                                },
                              });
                            },
                          });
                        }}
                      >
                        {shareOrUnshareStr}
                      </Button>
                    </Space>

                    {/* { r.source === Source.INTERNAL && (
                      <Space split={<Divider type="vertical" />}>
                        <Button
                          type="link"
                          onClick={() => {
                            router.push(`/files/${r.clusterId}${r.sourcePath}`);
                          }}
                        >
                    查看文件
                        </Button>
                      </Space>
                    )} */}

                    <Space split={<Divider type="vertical" />}>
                      <EditImageModalButton refetch={refetch} isEdit={true} editData={r} clusters={clusters}>
                        编辑
                      </EditImageModalButton>
                    </Space>
                    <Space split={<Divider type="vertical" />}>
                      <Button
                        type="link"
                        onClick={() => {
                          deleteSourceFileRef.current = false;
                          modal.confirm({
                            title: "删除镜像",
                            content: (
                              <>
                                <p>{`是否确认删除镜像${r.name}标签${r.tag}？如该镜像已分享，则分享的镜像也会被删除。`}</p>

                                {r.source === Source.INTERNAL && (
                                  <Checkbox
                                    onChange={(e) => (deleteSourceFileRef.current = e.target.checked)}
                                  >
                                    同时删除源文件
                                  </Checkbox>
                                )}

                              </>
                            ),
                            onOk: async () => {
                              deleteSourceFileRef.current ?

                                await deleteImageMutation.mutateAsync({
                                  id: r.id,
                                }).then(async () => {
                                  await deleteSourceFileMutation.mutateAsync({
                                    target: "FILE",
                                    clusterId: cluster?.id ?? "",
                                    path: r.sourcePath,
                                  }).then(() => {
                                    message.success("删除成功");
                                    refetch();
                                  });
                                }) :
                                await deleteImageMutation.mutateAsync({
                                  id: r.id,
                                }).then(() => {
                                  message.success("删除成功");
                                  refetch();
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
                    <CopyImageModalButton
                      refetch={refetch}
                      copiedId={r.id}
                      copiedName={r.name}
                      copiedTag={r.tag}
                    >
                      复制
                    </CopyImageModalButton>
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

