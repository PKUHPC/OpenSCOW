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
import { App, Button, Modal, Table } from "antd";
import { useRouter } from "next/navigation";
import React, { useCallback } from "react";
import { ModalButton } from "src/components/ModalLink";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { SharedStatus } from "src/models/common";
import { ModelInterface } from "src/models/Model";
import { Cluster } from "src/server/trpc/route/config";
import { AppRouter } from "src/server/trpc/router";
import { getSharedStatusText, getSharedStatusUpperText } from "src/utils/common";
import { formatDateTime } from "src/utils/datetime";
import { parseBooleanParam } from "src/utils/parse";
import { trpc } from "src/utils/trpc";

import { CopyPublicModelModal } from "./CopyPublicModelModal";
import { CreateAndEditVersionModal } from "./CreateAndEditVersionModal";

export interface Props {
  isPublic?: boolean;
  models: ModelInterface[];
  modelId: number;
  modelName: string;
  cluster: Cluster;
}

const EditVersionModalButton = ModalButton(CreateAndEditVersionModal, { type: "link" });
const CopyPublicModelModalButton = ModalButton(CopyPublicModelModal, { type: "link" });

export const ModelVersionList: React.FC<Props> = (
  { isPublic, modelId, modelName, cluster },
) => {
  const t = useI18nTranslateToString();
  const p = prefix("app.model.modelVersionList.");
  const pCommon = prefix("app.common.");

  const { message } = App.useApp();
  const [{ confirm }, confirmModalHolder] = Modal.useModal();
  const router = useRouter();

  const { data: versionData, isFetching, refetch, error: versionError } =
    trpc.model.versionList.useQuery({
      modelId,
      isPublic: isPublic !== undefined ? parseBooleanParam(isPublic) : undefined,
    });
  if (versionError) {
    message.error(t(p("notFound")));
  }

  const checkFileExist = trpc.file.checkFileExist.useMutation();

  const shareMutation = trpc.model.shareModelVersion.useMutation({
    onSuccess() {
      refetch();
      message.success(t(p("submitShare")));
    },
    onError: (err) => {
      const { data } = err as TRPCClientError<AppRouter>;
      if (data?.code === "FORBIDDEN") {
        message.error(t(p("noAuthShare")));
        return;
      }

      message.error(err.message);
    },
  });

  const unShareMutation = trpc.model.unShareModelVersion.useMutation({
    onSuccess() {
      refetch();
      message.success(t(p("cancelShare")));
    },
    onError: (err) => {
      const { data } = err as TRPCClientError<AppRouter>;
      if (data?.code === "FORBIDDEN") {
        message.error(t(p("noAuthCancel")));
        return;
      }

      message.error(t(p("shareFailed")));
    },
  });

  const deleteModelVersionMutation = trpc.model.deleteModelVersion.useMutation({
    onSuccess() {
      message.success(t(p("deleteSuccessfully")));
      refetch();
    },
    onError() {
      message.error(t(p("deleteFailed")));
    } });

  const deleteModelVersion = useCallback(
    (versionId: number, isConfirmed?: boolean) => {
      confirm({
        title: isConfirmed ? t(p("confirmedText")) : t(p("delete")),
        onOk:async () => {
          await deleteModelVersionMutation.mutateAsync({ versionId, modelId });
        },
      });
    },
    [modelId],
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
          { dataIndex: "versionName", title: t(p("versionName")) },
          { dataIndex: "versionDescription", title: t(p("versionDescription")) },
          { dataIndex: "algorithmVersion", title: t(p("algorithmVersion")) },
          { dataIndex: "createTime", title: t(p("createTime")), render:(createTime) => formatDateTime(createTime) },
          { dataIndex: "action", title: t(p("action")),
            ...isPublic ? {} : { width: 350 },
            render: (_, r) => {
              return isPublic ? (
                <CopyPublicModelModalButton
                  modelId={modelId}
                  modelName={modelName}
                  modelVersionId={r.id}
                  data={r}
                  cluster={cluster}
                >
                  {t("button.copyButton")}
                </CopyPublicModelModalButton>
              ) :
                (
                  <>
                    <EditVersionModalButton
                      modelId={modelId}
                      modelName={modelName}
                      cluster={cluster}
                      refetch={refetch}
                      editData={{
                        versionId:r.id,
                        versionName:r.versionName,
                        versionDescription:r.versionDescription,
                        algorithmVersion:r.algorithmVersion,
                      }}

                    >
                      {t("button.editButton")}
                    </EditVersionModalButton>

                    <Button
                      type="link"
                      onClick={async () => {
                        const checkExistRes =
                        await checkFileExist.mutateAsync({ clusterId:cluster.id, path:r.privatePath });

                        if (checkExistRes?.exists) {
                          router.push(`/files/${cluster.id}${r.privatePath}`);
                        } else {
                          deleteModelVersion(r.id, true);
                        }
                      }}
                    >
                      {t(p("check"))}
                    </Button>
                    <Button
                      type="link"
                      disabled={r.sharedStatus === SharedStatus.SHARING || r.sharedStatus === SharedStatus.UNSHARING}
                      onClick={() => {
                        confirm({
                          title: t(p("share")),
                          content:
                          `${t(p("confirmed"),[t(pCommon(getSharedStatusText(r.sharedStatus))),r.versionName])}`,
                          onOk: async () => {
                            if (r.sharedStatus === SharedStatus.SHARED) {

                              await unShareMutation.mutateAsync({
                                versionId: r.id,
                                modelId,
                              });
                            } else {
                              await shareMutation.mutateAsync({
                                versionId: r.id,
                                modelId,
                              });
                            }
                          },
                        });
                      }}
                    >
                      {t(pCommon(getSharedStatusUpperText(r.sharedStatus)))}
                    </Button>
                    <Button
                      type="link"
                      disabled={r.sharedStatus === SharedStatus.SHARING || r.sharedStatus === SharedStatus.UNSHARING}
                      onClick={() => {
                        deleteModelVersion(r.id);
                      }}
                    >
                      {t("button.deleteButton")}
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
