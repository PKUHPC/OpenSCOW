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
import { App, Button, Table } from "antd";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect } from "react";
import { ModalButton } from "src/components/ModalLink";
import { SharedStatus } from "src/models/common";
import { Cluster } from "src/server/trpc/route/config";
import { DatasetInterface } from "src/server/trpc/route/dataset/dataset";
import { AppRouter } from "src/server/trpc/router";
import { getSharedStatusText } from "src/utils/common";
import { formatDateTime } from "src/utils/datetime";
import { parseBooleanParam } from "src/utils/parse";
import { trpc } from "src/utils/trpc";

import { CopyPublicDatasetModal } from "./CopyPublicDatasetModal";
import { CreateEditDSVersionModal } from "./CreateEditDSVersionModal";

export interface Props {
  datasets: DatasetInterface[];
  datasetId: number;
  datasetName: string;
  isPublic?: boolean;
  cluster: Cluster;
}

const CopyPublicDatasetModalButton = ModalButton(CopyPublicDatasetModal, { type: "link" });

export const DatasetVersionList: React.FC<Props> = (
  { datasets, datasetId, datasetName, isPublic, cluster },
) => {
  const { modal, message } = App.useApp();
  const CreateEditVersionModalButton = ModalButton(CreateEditDSVersionModal, { type: "link" });

  const router = useRouter();

  const { data: versionData, isFetching, refetch, error: versionError }
    = trpc.dataset.versionList.useQuery({
      datasetId,
      isPublic:  isPublic !== undefined ? parseBooleanParam(isPublic) : undefined,
    });
  if (versionError) {
    message.error("找不到数据集版本");
  }

  useEffect(() => {
    refetch();
  }, [datasets]);

  const checkFileExist = trpc.file.checkFileExist.useMutation();

  const shareMutation = trpc.dataset.shareDatasetVersion.useMutation({
    onSuccess() {
      refetch();
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
      refetch();
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
      refetch();
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
            datasetVersionId: id,
            datasetId,
          });
        },
      });
    },
    [],
  );

  return (
    <Table
      rowKey="id"
      dataSource={versionData?.items ?? []}
      loading={isFetching}
      pagination={false}
      scroll={{ y:275 }}
      columns={[
        { dataIndex: "versionName", title: "版本名称" },
        { dataIndex: "versionDescription", title: "版本描述" },
        isPublic ? {} : { dataIndex: "privatePath", title: "路径" },
        { dataIndex: "createTime", title: "创建时间",
          render: (_, r) => r.createTime ? formatDateTime(r.createTime) : "-" },
        { dataIndex: "action", title: "操作",
          render: (_, r) => {
            return !isPublic ? (
              <>
                <CreateEditVersionModalButton
                  key="edit"
                  datasetId={r.datasetId}
                  datasetName={datasetName}
                  cluster={cluster}
                  isEdit={true}
                  editData={r}
                  refetch={refetch}
                >
                  编辑
                </CreateEditVersionModalButton>
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
                <Button
                  type="link"
                  disabled={r.sharedStatus === SharedStatus.SHARING || r.sharedStatus === SharedStatus.UNSHARING}
                  onClick={() => {
                    modal.confirm({
                      title: "分享数据集版本",
                      content: `确认${getSharedStatusText(r.sharedStatus)}数据集版本 ${r.versionName}?`,
                      onOk: async () => {
                        if (r.sharedStatus === SharedStatus.SHARED) {
                          await unShareMutation.mutateAsync({
                            datasetVersionId: r.id,
                            datasetId: r.datasetId,
                          });
                        } else {
                          await shareMutation.mutateAsync({
                            datasetVersionId: r.id,
                            datasetId: r.datasetId,
                          });
                        }
                      },
                    });
                  }}
                >{getSharedStatusText(r.sharedStatus)}</Button>
                <Button
                  type="link"
                  disabled={r.sharedStatus === SharedStatus.SHARING || r.sharedStatus === SharedStatus.UNSHARING}
                  onClick={() => {
                    deleteDatasetVersion(r.id, r.datasetId);
                  }}
                >
                  删除
                </Button>
              </>
            ) : (
              <CopyPublicDatasetModalButton
                datasetId={r.datasetId}
                datasetName={datasetName}
                datasetVersionId={r.id}
                cluster={cluster}
                data={r}
              >
                复制
              </CopyPublicDatasetModalButton>
            );
          },
        },
      ]}
    />
  );
};


