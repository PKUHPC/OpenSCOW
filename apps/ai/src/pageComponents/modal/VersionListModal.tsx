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
import { trpc } from "src/utils/trpc";

import { CreateAndEditVersionModal } from "./CreateAndEditVersionModal";

export interface Props {
  open: boolean;
  onClose: () => void;
  isPublic?: boolean;
  algorithmId: number;
  algorithmName: string;
}

const CreateAndEditVersionModalButton = ModalButton(CreateAndEditVersionModal, { type: "link" });

export const VersionListModal: React.FC<Props> = (
  { open, onClose, isPublic, algorithmId, algorithmName },
) => {
  const { message } = App.useApp();
  const [{ confirm }, confirmModalHolder] = Modal.useModal();

  const router = useRouter();

  const { data, isFetching, error } = trpc.algorithm.getAlgorithmVersions.useQuery({ id:algorithmId }, {
  });

  if (error) {
    message.error("找不到对应的算法版本");
  }

  const changeAlgorithmVersion = useCallback(
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

  const deleteAlgorithmVersion = useCallback(
    (id: number, name: string) => {
      console.log(id);
      confirm({
        title: "删除算法版本",
        content: `确认删除算法版本${name}？如该算法已分享，则分享的算法版本也会被删除。`,
        onOk() {
          message.success("删除成功");
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
        dataSource={data?.versions}
        loading={isFetching}
        pagination={false}
        scroll={{ y:275 }}
        columns={[
          { dataIndex: "name", title: "版本名称" },
          { dataIndex: "description", title: "版本描述" },
          { dataIndex: "createTime", title: "创建时间" },
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
                    <CreateAndEditVersionModalButton
                      key="edit"
                      algorithmId={r.id}
                      algorithmName={r.name}
                      versionName={r.name}
                      versionDescription={r.description}
                    >
                    编辑
                    </CreateAndEditVersionModalButton>

                    <Button
                      type="link"
                      onClick={() => {
                        router.push(r.path);
                      }}
                    >
                    查看文件
                    </Button>

                    <Button
                      type="link"
                      onClick={() => {
                        changeAlgorithmVersion(r.id, r.name, r.isShared);
                      }}
                    >
                      {r.isShared ? "取消分享" : "分享"}
                    </Button>
                    <Button
                      type="link"
                      onClick={() => {
                        deleteAlgorithmVersion(r.id, r.name);
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
