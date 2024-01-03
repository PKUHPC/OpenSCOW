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
import { App, Button, Checkbox, Modal, Table } from "antd";
import { useRouter } from "next/navigation";
import React, { useCallback, useRef } from "react";
import { ModalButton } from "src/components/ModalLink";
import { AlgorithmVersionInterface } from "src/models/Algorithm";
import { SharedStatus } from "src/models/common";
import { AppRouter } from "src/server/trpc/router";
import { getSharedStatusText } from "src/utils/common";
import { Cluster } from "src/utils/config";
import { formatDateTime } from "src/utils/datetime";
import { trpc } from "src/utils/trpc";

import { CreateAndEditVersionModal } from "./CreateAndEditVersionModal";


export interface Props {
  open: boolean;
  onClose: () => void;
  isPublic?: boolean;
  algorithmId: number;
  algorithmName: string | undefined;
  algorithmVersionData: AlgorithmVersionInterface[];
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

  const deleteSourceFileRef = useRef(false);
  const deleteSourceFileMutation = trpc.file.deleteItem.useMutation();

  const shareMutation = trpc.algorithm.shareAlgorithmVersion.useMutation({
    onSuccess() {
      refetch();
      message.success("分享成功");
    },
    onError: (err) => {
      const { data } = err as TRPCClientError<AppRouter>;
      if (data?.code === "FORBIDDEN") {
        message.error("没有权限分享此版本");
      }
    },
  });

  const unShareMutation = trpc.algorithm.unShareAlgorithmVersion.useMutation({
    onSuccess() {
      refetch();
      message.success("取消分享成功");
    },
    onError(err) {
      const { data } = err as TRPCClientError<AppRouter>;
      if (data?.code === "FORBIDDEN") {
        message.error("没有权限取消分享此版本");
      }
    },
  });

  const deleteAlgorithmVersionMutation = trpc.algorithm.deleteAlgorithmVersion.useMutation({
    onError(e) {
      console.log(e);
      message.error("删除算法版本失败");
    } });

  const deleteAlgorithmVersion = useCallback(
    (id: number, name: string, path: string) => {
      deleteSourceFileRef.current = false;
      confirm({
        title: "删除算法版本",
        content: (
          <>
            <p>{`确认删除算法版本${name}？如该算法版本已分享，则分享的算法版本也会被删除。`}</p>
            <Checkbox
              onChange={(e) => { deleteSourceFileRef.current = e.target.checked; } }
            >
              同时删除源文件
            </Checkbox>
          </>
        ),
        onOk:async () => {
          await deleteAlgorithmVersionMutation.mutateAsync({ id, algorithmId })
            .then(() => {
              deleteSourceFileRef.current && deleteSourceFileMutation.mutateAsync({
                target: "DIR",
                clusterId: cluster?.id ?? "",
                path,
              });
            })
            .then(() => {
              message.success("删除算法版本成功");
              refetch();
            });
        },
      });
    },
    [algorithmId, cluster],
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
                        router.push(`/files/${cluster?.id}${r.privatePath}`);
                      }}
                    >
                    查看文件
                    </Button>
                    <Button
                      type="link"
                      disabled={r.sharedStatus === SharedStatus.SHARING || r.sharedStatus === SharedStatus.UNSHARING}
                      onClick={() => {
                        confirm({
                          title: "分享算法版本",
                          content: `确认${getSharedStatusText(r.sharedStatus)}算法版本 ${r.versionName}?`,
                          onOk: async () => {
                            r.sharedStatus === SharedStatus.SHARED ?
                              await unShareMutation.mutateAsync({
                                versionId: r.id,
                                algorithmId,
                              })
                              :
                              await shareMutation.mutateAsync({
                                versionId: r.id,
                                algorithmId,
                                sourceFilePath: r.path });
                          },
                        });
                      }}
                    >
                      {getSharedStatusText(r.sharedStatus)}
                    </Button>
                    <Button
                      type="link"
                      onClick={() => {
                        deleteAlgorithmVersion(r.id, r.versionName, r.privatePath);
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
