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
import React, { useCallback } from "react";
import { ModalButton } from "src/components/ModalLink";
import { SharedStatus } from "src/models/common";
import { DatasetVersionInterface } from "src/models/Dateset";
import { Cluster } from "src/server/trpc/route/config";
import { AppRouter } from "src/server/trpc/router";
import { getSharedStatusText } from "src/utils/common";
import { formatDateTime } from "src/utils/datetime";
import { trpc } from "src/utils/trpc";

import { CopyPublicDatasetModal } from "./CopyPublicDatasetModal";
import { CreateEditDSVersionModal } from "./CreateEditDSVersionModal";

export interface Props {
  open: boolean;
  onClose: () => void;
  onRefetch: () => void;
  isFetching: boolean;
  datasetName: string;
  datasetVersions: DatasetVersionInterface[];
  isPublic?: boolean;
  cluster: Cluster;
}

const CopyPublicDatasetModalButton = ModalButton(CopyPublicDatasetModal, { type: "link" });

export const DatasetVersionsModal: React.FC<Props> = (
  { open, onClose, onRefetch, isFetching, datasetName, isPublic, cluster, datasetVersions },
) => {
  const { modal, message } = App.useApp();
  const CreateEditVersionModalButton = ModalButton(CreateEditDSVersionModal, { type: "link" });

  const router = useRouter();

  const checkFileExist = trpc.file.checkFileExist.useMutation();

  const shareMutation = trpc.dataset.shareDatasetVersion.useMutation({
    onSuccess() {
      onRefetch();
      message.success("提交分享请求");
    },
    onError: (err) => {
      const { data } = err as TRPCClientError<AppRouter>;
      if (data?.code === "FORBIDDEN") {
        message.error("没有权限分享此数据集版本");
      } else {
        message.error("分享数据集版本失败");
      }
    },
  });

  const unShareMutation = trpc.dataset.unShareDatasetVersion.useMutation({
    onSuccess() {
      onRefetch();
      message.success("提交取消分享请求");
    },
    onError: (err) => {
      const { data } = err as TRPCClientError<AppRouter>;
      if (data?.code === "FORBIDDEN") {
        message.error("没有权限取消分享此数据集版本");
      } else {
        message.error("取消分享数据集版本失败");
      }
    },
  });

  const deleteMutation = trpc.dataset.deleteDatasetVersion.useMutation({
    onSuccess() {
      message.success("删除成功");
      onRefetch();
    },
    onError: (err) => {
      const { data } = err as TRPCClientError<AppRouter>;
      if (data?.code === "NOT_FOUND") {
        message.error("找不到该数据集版本");
      } else {
        message.error("删除数据集版本失败");
      }
    },
  });

  const deleteDatasetVersion = useCallback(
    (id: number, datasetId: number, isConfirmed?: boolean) => {
      modal.confirm({
        title: isConfirmed ? "源文件已被删除，是否删除本条数据" : "删除数据集版本",
        onOk: async () => {
          await deleteMutation.mutateAsync({
            id,
            datasetId,
          });
        },
      });
    },
    [],
  );

  return (
    <Modal
      title={`版本列表: ${datasetName}`}
      open={open}
      onCancel={onClose}
      centered
      width={1000}
      footer={false}
    >
      <Table
        rowKey="id"
        dataSource={datasetVersions}
        loading={isFetching}
        pagination={false}
        scroll={{ y:275 }}
        columns={[
          { dataIndex: "versionName", title: "版本名称" },
          { dataIndex: "versionDescription", title: "版本描述" },
          isPublic ? {} : { dataIndex: "privatePath", title: "路径" },
          { dataIndex: "createTime", title: "创建时间",
            render: (_, r) => formatDateTime(r.createTime) },
          { dataIndex: "action", title: "操作",
            render: (_, r) => {
              return !isPublic ? (
                <>
                  <Space split={<Divider type="vertical" />}>
                    <CreateEditVersionModalButton
                      key="edit"
                      datasetId={r.datasetId}
                      datasetName={datasetName}
                      cluster={cluster}
                      isEdit={true}
                      editData={r}
                      refetch={onRefetch}
                    >
                    编辑
                    </CreateEditVersionModalButton>
                  </Space>
                  <Space split={<Divider type="vertical" />}>
                    <Button
                      type="link"
                      onClick={async () => {
                        const checkExistRes =
                        await checkFileExist.mutateAsync({ clusterId:cluster.id, path:r.privatePath });

                        if (checkExistRes?.exists) {
                          router.push(`/files/${cluster.id}${r.privatePath}`);
                        } else {
                          deleteDatasetVersion(r.id, r.datasetId, true);
                        }
                      }}
                    >
                      查看文件
                    </Button>
                  </Space>
                  <Space split={<Divider type="vertical" />}>
                    <Button
                      type="link"
                      disabled={r.sharedStatus === SharedStatus.SHARING || r.sharedStatus === SharedStatus.UNSHARING}
                      onClick={() => {
                        modal.confirm({
                          title: "分享数据集版本",
                          content: `确认${getSharedStatusText(r.sharedStatus)}数据集版本 ${r.versionName}?`,
                          onOk: async () => {
                            r.sharedStatus === SharedStatus.SHARED ?
                              await unShareMutation.mutateAsync({
                                id: r.id,
                                datasetId: r.datasetId,
                              })
                              :
                              await shareMutation.mutateAsync({
                                id: r.id,
                                datasetId: r.datasetId,
                                sourceFilePath: r.path,
                              });
                          },
                        });
                      }}
                    >{getSharedStatusText(r.sharedStatus)}</Button>
                  </Space>
                  <Space split={<Divider type="vertical" />}>
                    <Button
                      type="link"
                      disabled={r.sharedStatus === SharedStatus.SHARING || r.sharedStatus === SharedStatus.UNSHARING}
                      onClick={() => {
                        deleteDatasetVersion(r.id, r.datasetId);
                      }}
                    >
                      删除
                    </Button>
                  </Space>
                </>
              ) : (
                <Space split={<Divider type="vertical" />}>
                  <CopyPublicDatasetModalButton
                    datasetId={r.datasetId}
                    datasetName={datasetName}
                    datasetVersionId={r.id}
                    cluster={cluster}
                    data={r}
                  >
                    复制
                  </CopyPublicDatasetModalButton>
                </Space>
              );
            },
          },
        ]}
      />
    </Modal>
  );
};


