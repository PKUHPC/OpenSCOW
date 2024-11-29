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
import React, { useCallback, useEffect } from "react";
import { ModalButton } from "src/components/ModalLink";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { AlgorithmInterface } from "src/models/Algorithm";
import { SharedStatus } from "src/models/common";
import { Cluster } from "src/server/trpc/route/config";
import { AppRouter } from "src/server/trpc/router";
import { getSharedStatusText, getSharedStatusUpperText } from "src/utils/common";
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
  const t = useI18nTranslateToString();
  const p = prefix("app.algorithm.algorithmVersionList.");
  const pCommon = prefix("app.common.");

  const { message } = App.useApp();
  const [{ confirm }, confirmModalHolder] = Modal.useModal();
  const router = useRouter();

  const { data: versionData, isFetching, refetch, error: versionError } =
    trpc.algorithm.getAlgorithmVersions.useQuery({
      algorithmId:algorithmId,
      isPublic: isPublic !== undefined ? parseBooleanParam(isPublic) : undefined,
    });
  if (versionError) {
    message.error(t(p("notFound")));
  }

  useEffect(() => {
    refetch();
  }, [algorithms]);

  const checkFileExist = trpc.file.checkFileExist.useMutation();

  const shareMutation = trpc.algorithm.shareAlgorithmVersion.useMutation({
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

      message.error(t(p("shareFailed")));
    },
  });

  const unShareMutation = trpc.algorithm.unShareAlgorithmVersion.useMutation({
    onSuccess() {
      refetch();
      message.success(t(p("cancelShare")));
    },
    onError(err) {
      const { data } = err as TRPCClientError<AppRouter>;
      if (data?.code === "FORBIDDEN") {
        message.error(t(p("noAuthCancel")));
        return;
      }

      message.error(t(p("cancelShareFailed")));
    },
  });

  const deleteAlgorithmVersionMutation = trpc.algorithm.deleteAlgorithmVersion.useMutation({
    onSuccess() {
      message.success(t(p("deleteSuccessfully")));
      refetch();
    },
    onError() {
      message.error(t(p("deleteFailed")));
    } });

  const deleteAlgorithmVersion = useCallback(
    (id: number, isConfirmed?: boolean) => {
      confirm({
        title: isConfirmed ? t(p("confirmedText")) : t(p("delete")),
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
          { dataIndex: "versionName", title: t(p("versionName")) },
          { dataIndex: "versionDescription", title: t(p("versionDescription")) },
          { dataIndex: "createTime", title: t(p("createTime")), render:(createTime) => formatDateTime(createTime) },
          { dataIndex: "action", title: t(p("action")),
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
                  {t("button.copyButton")}
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
                          deleteAlgorithmVersion(r.id, true);
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
                      {t(pCommon(getSharedStatusUpperText(r.sharedStatus)))}
                    </Button>
                    <Button
                      type="link"
                      disabled={r.sharedStatus === SharedStatus.SHARING || r.sharedStatus === SharedStatus.UNSHARING}
                      onClick={() => {
                        deleteAlgorithmVersion(r.id);
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
