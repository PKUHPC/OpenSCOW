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

interface algorithmVersion {
  id: number;
  versionName: string;
  versionDescription: string;
  path: string;
  privatePath: string;
  isShared: boolean;
  createTime: string;
}

export interface Props {
  open: boolean;
  onClose: () => void;
  isPublic?: boolean;
  algorithmId: number;
  algorithmName: string | undefined;
  algorithmVersionData: algorithmVersion[];
  isFetching: boolean;
  refetch: () => void;
  cluster?: Cluster;
}

const EditVersionModalButton = ModalButton(CreateAndEditVersionModal, { type: "link" });

export const VersionListModal: React.FC<Props> = (
  { open, onClose, isPublic, algorithmId, algorithmName, algorithmVersionData, isFetching, refetch, cluster },
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

  const deleteAlgorithmVersionMutation = trpc.algorithm.deleteAlgorithmVersion.useMutation({
    onSuccess() {
      message.success("删除算法版本成功");
      refetch();
    },
    onError(e) {
      console.log(e);
      message.error("删除算法版本失败");
    } });

  const deleteAlgorithmVersion = useCallback(
    (id: number, name: string) => {
      confirm({
        title: "删除算法版本",
        content: `确认删除算法版本${name}？如该算法版本已分享，则分享的算法版本也会被删除。`,
        onOk() {
          deleteAlgorithmVersionMutation.mutate({ id });
        },
      });
    },
    [],
  );

  return (
    <Modal
      title={`版本列表:${algorithmName}`}
      open={open}
      onCancel={onClose}
      centered
      width={1000}
    >
      <Table
        rowKey="id"
        dataSource={algorithmVersionData}
        loading={isFetching}
        pagination={false}
        scroll={{ y:275 }}
        columns={[
          { dataIndex: "versionName", title: "版本名称" },
          { dataIndex: "versionDescription", title: "版本描述" },
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
                      algorithmId={algorithmId}
                      algorithmName={algorithmName}
                      refetch={refetch}
                      cluster={cluster}
                      editData={{
                        versionId:r.id,
                        versionName:r.versionName,
                        versionDescription:r.versionDescription,
                      }}
                    >
                    编辑
                    </EditVersionModalButton>

                    <Button
                      type="link"
                      onClick={() => {
                        router.push(r.privatePath);
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
                        deleteAlgorithmVersion(r.id, r.versionName);
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
