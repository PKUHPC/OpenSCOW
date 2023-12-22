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

import { TRPCClientError } from "@trpc/client";
import { App, Button, Divider, Modal, Space, Table } from "antd";
import { useRouter } from "next/navigation";
import React from "react";
import { ModalButton } from "src/components/ModalLink";
import { AppRouter } from "src/server/trpc/router";
import { trpc } from "src/utils/trpc";

import { CreateEditDVersionModal } from "./CreateEditDVersionModal";

export interface Props {
  open: boolean;
  onClose: () => void;
  onRefetch: () => void;
  datasetId: number;
  datasetName: string;
}

export const DatasetVersionsModal: React.FC<Props> = (
  { open, onClose, onRefetch, datasetId, datasetName },
) => {
  const { modal, message } = App.useApp();
  const CreateAndEditVersionModalButton = ModalButton(CreateEditDVersionModal, { type: "link" });

  const router = useRouter();

  const { data, refetch, isFetching, error } = trpc.dataset.versionList.useQuery({ datasetId }, {});

  if (error) {
    message.error("找不到对应的数据集版本");
  }

  // const shareMutation = trpc.dataset..useMutation({
  //   onError: (err) => {
  //     const { data } = err as TRPCClientError<AppRouter>;
  //     if (data?.code === "NOT_FOUND") {
  //       message.error("找不到该数据集版本");
  //     }
  //   },
  // });

  const deleteDVersionMutation = trpc.dataset.deleteDatasetVersion.useMutation({
    onError: (err) => {
      const { data } = err as TRPCClientError<AppRouter>;
      if (data?.code === "NOT_FOUND") {
        message.error("找不到该数据集版本");
      }
    },
  });


  return (
    <Modal
      title={`版本列表: ${datasetName}`}
      open={open}
      onCancel={onClose}
      centered
      width={1000}
    >
      <Table
        rowKey="id"
        dataSource={data?.items}
        loading={isFetching}
        pagination={false}
        scroll={{ y:275 }}
        columns={[
          { dataIndex: "versionName", title: "版本名称" },
          { dataIndex: "versionDescription", title: "版本描述" },
          { dataIndex: "path", title: "路径" },
          { dataIndex: "createTime", title: "创建时间" },
          { dataIndex: "action", title: "操作",
            render: (_, r) => {

              return (
                <>
                  <Space split={<Divider type="vertical" />}>
                    <CreateAndEditVersionModalButton
                      key="edit"
                      datasetId={r.datasetId}
                      datasetName={datasetName}
                      isEdit={true}
                      editData={r}
                      refetch={refetch}
                    >
                    编辑
                    </CreateAndEditVersionModalButton>
                  </Space>

                  <Space split={<Divider type="vertical" />}>
                    <Button
                      type="link"
                      onClick={() => {
                        router.push(r.path);
                      }}
                    >
                      查看文件
                    </Button>
                  </Space>

                  <Space split={<Divider type="vertical" />}>

                    <Button
                      type="link"
                      onClick={() => {
                        // modal.confirm({
                        //   title: "分享数据集版本",
                        //   content: `确认${r.isShared ? "取消分享" : "分享"}数据集版本 ${r.versionName}?`,
                        //   onOk: () => {
                        //     shareMutation.mutate({

                        //     }, {
                        //       onSuccess() {
                        //         refetch();
                        //         message.success(r.isShared ? "取消分享成功" : "分享成功");
                        //       },
                        //     });
                        //   },
                        // });
                      }}
                    >{r.isShared ? "取消分享" : "分享"}</Button>
                  </Space>

                  <Space split={<Divider type="vertical" />}>
                    <Button
                      type="link"
                      onClick={() => {
                        modal.confirm({
                          title: "删除数据集版本",
                          content: `是否确认删除数据集${datasetName}版本${r.name}？如该数据集版本已分享，则分享的数据集版本也会被删除。`,
                          onOk: () => {
                            deleteDVersionMutation.mutate({
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
              );

            },
          },
        ]}
      />
    </Modal>
  );
};
