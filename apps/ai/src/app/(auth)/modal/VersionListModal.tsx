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

import { App, Button, Modal, Table } from "antd";
import { useRouter } from "next/navigation";
import React, { useCallback } from "react";
import { ModalButton } from "src/components/ModalLink";
import { Cluster } from "src/utils/config";
import { formatDateTime } from "src/utils/datetime";
import { trpc } from "src/utils/trpc";

import { CreateAndEditVersionModal } from "./CreateAndEditVersionModal";

interface modalVersion {
  id: number;
  versionName: string;
  versionDescription?: string;
  algorithmVersion?: string;
  path: string;
  privatePath: string;
  isShared: boolean;
  createTime: string;
}

export interface Props {
  open: boolean;
  onClose: () => void;
  isPublic?: boolean;
  modalId: number;
  modalName: string | undefined;
  modalVersionData: modalVersion[];
  isFetching: boolean;
  refetch: () => void;
  cluster?: Cluster;
}

const EditVersionModalButton = ModalButton(CreateAndEditVersionModal, { type: "link" });

export const VersionListModal: React.FC<Props> = (
  { open, onClose, isPublic, modalId, modalName, modalVersionData, isFetching, refetch, cluster },
) => {
  const { message } = App.useApp();
  const [{ confirm }, confirmModalHolder] = Modal.useModal();
  const router = useRouter();

  const shareAlgorithmVersion = useCallback(
    (id: number, name: string, shareStatus: boolean) => {
      console.log(id);
      const text = shareStatus ? "取消" : "";
      confirm({
        title: `${text}分享算法版本`,
        content: `确认${text}分享算法版本${name}`,
        onOk() {
          message.success(`${text}分享算法版本成功`);
        },
      });
    },
    [],
  );

  const deleteModalVersionMutation = trpc.modal.deleteModalVersion.useMutation({
    onError(e) {
      console.log(e);
      message.error("删除模型版本失败");
    } });

  const deleteModalVersion = useCallback(
    (id: number, name: string) => {
      confirm({
        title: "删除模型版本",
        content: `确认删除模型版本${name}？如该模型版本已分享，则分享的模型版本也会被删除。`,
        onOk:async () => {
          await new Promise<void>((resolve) => {
            deleteModalVersionMutation.mutate({ id, modalId }, {
              onSuccess() {
                message.success("删除模型版本成功");
                refetch();
                resolve();
              },
              onError() {
                resolve();
              },
            });
          });
        },
      });
    },
    [modalId],
  );

  return (
    <Modal
      title={`版本列表:${modalName}`}
      open={open}
      onCancel={onClose}
      centered
      width={1000}
    >
      <Table
        rowKey="id"
        dataSource={modalVersionData}
        loading={isFetching}
        pagination={false}
        scroll={{ y:275 }}
        columns={[
          { dataIndex: "versionName", title: "版本名称" },
          { dataIndex: "versionDescription", title: "版本描述" },
          { dataIndex: "algorithmVersion", title: "算法版本" },
          { dataIndex: "createTime", title: "创建时间", render:(_) => formatDateTime(_) },
          { dataIndex: "action", title: "操作",
            ...isPublic ? {} : { width: 350 },
            render: (_, r) => {
              return isPublic ? (
                <Button
                  type="link"
                  onClick={() => {
                  }}
                >
                    复制
                </Button>
              ) :
                (
                  <>
                    <EditVersionModalButton
                      modalId={modalId}
                      modalName={modalName}
                      cluster={cluster}
                      refetch={refetch}
                      editData={{
                        versionId:r.id,
                        versionName:r.versionName,
                        versionDescription:r.versionDescription,
                        algorithmVersion:r.algorithmVersion,
                      }}

                    >
                    编辑
                    </EditVersionModalButton>

                    <Button
                      type="link"
                      onClick={() => {
                        router.push(`/files/${cluster?.id}${r.privatePath}`);
                      }}
                    >
                    查看文件
                    </Button>

                    <Button
                      type="link"
                      onClick={() => {
                        shareAlgorithmVersion(r.id, r.versionName, r.isShared);
                      }}
                    >
                      {r.isShared ? "取消分享" : "分享"}
                    </Button>
                    <Button
                      type="link"
                      onClick={() => {
                        deleteModalVersion(r.id, r.versionName);
                      }}
                    >
                    删除
                    </Button>
                  </>
                );

            },
          },
        ]}
      />
      {/* antd中modal组件 */}
      {confirmModalHolder}
    </Modal>
  );
};
