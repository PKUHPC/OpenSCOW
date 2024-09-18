/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { TRPCClientError } from "@trpc/client";
import { App, Button, Modal, Table } from "antd";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect } from "react";
import { ModalButton } from "src/components/ModalLink";
import { AlgorithmInterface } from "src/models/Algorithm";
import { SharedStatus } from "src/models/common";
import { Cluster } from "src/server/trpc/route/config";
import { AppRouter } from "src/server/trpc/router";
import { getSharedStatusText } from "src/utils/common";
import { formatDateTime } from "src/utils/datetime";
import { parseBooleanParam } from "src/utils/parse";
import { trpc } from "src/utils/trpc";

import { CopyPublicAlgorithmModal } from "./CopyPublicAlgorithmModal";
import { CreateAndEditVersionModal } from "./CreateAndEditVersionModal";


export interface Props {
  isPublic?: boolean;
  algorithms: AlgorithmInterface[];
  algorithmId: number;
  algorithmName: string | undefined;
  cluster: Cluster;
}

const EditVersionModalButton = ModalButton(CreateAndEditVersionModal, { type: "link" });
const CopyPublicAlgorithmModalButton = ModalButton(CopyPublicAlgorithmModal, { type: "link" });

export const AlgorithmVersionList: React.FC<Props> = (
  { isPublic, algorithms, algorithmId, algorithmName, cluster },
) => {
  const { message } = App.useApp();
  const [{ confirm }, confirmModalHolder] = Modal.useModal();
  const router = useRouter();

  const { data: versionData, isFetching, refetch, error: versionError } =
    trpc.algorithm.getAlgorithmVersions.useQuery({
      algorithmId:algorithmId,
      isPublic: isPublic !== undefined ? parseBooleanParam(isPublic) : undefined,
    });
  if (versionError) {
    message.error("找不到算法版本");
  }

  useEffect(() => {
    refetch();
  }, [algorithms]);

  const checkFileExist = trpc.file.checkFileExist.useMutation();

  const shareMutation = trpc.algorithm.shareAlgorithmVersion.useMutation({
    onSuccess() {
      refetch();
      message.success("提交分享请求");
    },
    onError: (err) => {
      const { data } = err as TRPCClientError<AppRouter>;
      if (data?.code === "FORBIDDEN") {
        message.error("没有权限分享此版本");
        return;
      }

      message.error("分享失败");
    },
  });

  const unShareMutation = trpc.algorithm.unShareAlgorithmVersion.useMutation({
    onSuccess() {
      refetch();
      message.success("提交取消分享");
    },
    onError(err) {
      const { data } = err as TRPCClientError<AppRouter>;
      if (data?.code === "FORBIDDEN") {
        message.error("没有权限取消分享此版本");
        return;
      }

      message.error("取消分享失败");
    },
  });

  const deleteAlgorithmVersionMutation = trpc.algorithm.deleteAlgorithmVersion.useMutation({
    onSuccess() {
      message.success("删除算法版本成功");
      refetch();
    },
    onError() {
      message.error("删除算法版本失败");
    } });

  const deleteAlgorithmVersion = useCallback(
    (id: number, isConfirmed?: boolean) => {
      confirm({
        title: isConfirmed ? "源文件已被删除，是否删除本条数据" : "删除算法版本",
        onOk:async () => {
          await deleteAlgorithmVersionMutation.mutateAsync({ algorithmVersionId: id, algorithmId });
        },
      });
    },
    [algorithmId],
  );

  return (
    <>
      <Table
        rowKey="id"
        dataSource={versionData?.items ?? []}
        loading={isFetching}
        pagination={false}
        scroll={{ y:275 }}
        columns={[
          { dataIndex: "versionName", title: "版本名称" },
          { dataIndex: "versionDescription", title: "版本描述" },
          { dataIndex: "createTime", title: "创建时间", render:(createTime) => formatDateTime(createTime) },
          { dataIndex: "action", title: "操作",
            ...isPublic ? {} : { width: 350 },
            render: (_, r) => {
              return isPublic ? (
                <CopyPublicAlgorithmModalButton
                  data={r}
                  algorithmId={algorithmId}
                  algorithmName={algorithmName}
                  algorithmVersionId={r.id}
                  cluster={cluster}
                >
                  复制
                </CopyPublicAlgorithmModalButton>
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
                      onClick={async () => {
                        const checkExistRes =
                        await checkFileExist.mutateAsync({ clusterId:cluster.id, path:r.privatePath });

                        if (checkExistRes?.exists) {
                          router.push(`/files/${cluster.id}${r.privatePath}`);
                        } else {
                          deleteAlgorithmVersion(r.id, true);
                        }
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
                            if (r.sharedStatus === SharedStatus.SHARED) {
                              await unShareMutation.mutateAsync({
                                algorithmVersionId: r.id,
                                algorithmId,
                              });
                            } else {
                              await shareMutation.mutateAsync({
                                algorithmVersionId: r.id,
                                algorithmId,
                              });
                            }
                          },
                        });
                      }}
                    >
                      {getSharedStatusText(r.sharedStatus)}
                    </Button>
                    <Button
                      type="link"
                      disabled={r.sharedStatus === SharedStatus.SHARING || r.sharedStatus === SharedStatus.UNSHARING}
                      onClick={() => {
                        deleteAlgorithmVersion(r.id);
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
    </>
  );
};
