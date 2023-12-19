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
import React from "react";
import { ModalButton } from "src/components/ModalLink";
import { trpc } from "src/utils/trpc";

import { CreateAndEditVersionModal } from "./CreateAndEditVersionModal";

export interface Props {
  open: boolean;
  onClose: () => void;
  algorithmId: number;
  algorithmName: string;
}

export const VersionListModal: React.FC<Props> = (
  { open, onClose, algorithmId, algorithmName },
) => {
  const { message } = App.useApp();
  const CreateAndEditVersionModalButton = ModalButton(CreateAndEditVersionModal, { type: "link" });

  const router = useRouter();

  const { data, isFetching, error } = trpc.algorithm.getAlgorithmVersions.useQuery({ id:algorithmId }, {
  });

  if (error) {
    message.error("找不到对应的算法版本");
  }

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
            render: (_, r) => {
              return (
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

                    }}
                  >
                    {r.isShared ? "取消分享" : "分享"}
                  </Button>
                  <Button
                    type="link"
                    onClick={() => {

                    }}
                  >
                    删除
                  </Button>
                  {/* <Space split={<Divider type="vertical" />}>
                    <CreateVersionModalButton key='版本列表' algorithmId={1} algorithmName="aaaa">
                        版本列表
                    </CreateVersionModalButton>
                  </Space>
                  <Space split={<Divider type="vertical" />}>
                    <CreateVersionModalButton key='编辑' algorithmId={1} algorithmName="aaaa">
                        编辑
                    </CreateVersionModalButton>
                  </Space>
                  <Space split={<Divider type="vertical" />}>
                    <CreateVersionModalButton key='删除' algorithmId={1} algorithmName="aaaa">
                        删除
                    </CreateVersionModalButton>
                  </Space> */}
                </>
              );

            },
          },
        ]}
      />
    </Modal>
  );
};
