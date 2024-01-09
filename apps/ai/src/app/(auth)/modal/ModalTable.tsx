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

"use client";

import { PlusOutlined } from "@ant-design/icons";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { App, Button, Checkbox, Form, Input, Modal, Space, Table, TableColumnsType } from "antd";
import { useCallback, useRef, useState } from "react";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { ModalButton } from "src/components/ModalLink";
import { ModalInterface } from "src/models/Modal";
import { Cluster } from "src/server/trpc/route/config";
import { formatDateTime } from "src/utils/datetime";
import { trpc } from "src/utils/trpc";

import { CreateAndEditModalModal } from "./CreateAndEditModalModal";
import { CreateAndEditVersionModal } from "./CreateAndEditVersionModal";
import { VersionListModal } from "./VersionListModal";

interface Props {
  isPublic: boolean;
  clusters: Cluster[];
}

interface FilterForm {
  nameOrDesc?: string,
  clusterId?: string,
}

interface PageInfo {
  page: number;
  pageSize?: number;
}

const CreateModalModalButton =
ModalButton(CreateAndEditModalModal, { type: "primary", icon: <PlusOutlined /> });
const EditModalModalButton =
ModalButton(CreateAndEditModalModal, { type: "link" });
const CreateVersionModalButton = ModalButton(CreateAndEditVersionModal, { type: "link" });

export const ModalTable: React.FC<Props> = ({ isPublic, clusters }) => {
  const [{ confirm }, confirmModalHolder] = Modal.useModal();
  const { message } = App.useApp();

  const [query, setQuery] = useState<FilterForm>(() => {
    return {
      nameOrDesc: undefined,
      framework: undefined,
      clusterId:undefined,
    };
  });

  const [form] = Form.useForm<FilterForm>();
  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: 10 });

  const [modalId, setModalId] = useState(0);
  const [modalName, setModalName] = useState<undefined | string>(undefined);
  const [cluster, setCluster] = useState<undefined | Cluster>(undefined);
  const [versionListModalIsOpen, setVersionListModalIsOpen] = useState(false);

  const deleteSourceFileRef = useRef(false);
  const deleteSourceFileMutation = trpc.file.deleteItem.useMutation();

  const { data, isFetching, refetch, error } = trpc.modal.list.useQuery(
    { ...pageInfo,
      nameOrDesc:query.nameOrDesc,
      clusterId:query.clusterId,
      isShared:isPublic,
    });
  if (error) {
    message.error("找不到模型");
  }

  const { data:versionData, isFetching:versionFetching, refetch:versionRefetch, error:versionError } =
  trpc.modal.versionList.useQuery({ modalId, isShared:isPublic }, {
    enabled:!!modalId,
  });
  if (versionError) {
    message.error("找不到模型版本");
  }

  const deleteModalMutation = trpc.modal.deleteModal.useMutation({
    onError(e) {
      console.log(e);
      message.error("删除模型失败");
    },
  });

  const deleteModal = useCallback(
    async (id: number, name: string, paths: string[], clusterId: string) => {
      deleteSourceFileRef.current = false;
      confirm({
        title: "删除模型",
        content: (
          <>
            <p>{`确认删除模型${name}？如该模型已分享，则分享的模型也会被删除。`}</p>
            <Checkbox
              onChange={(e) => { deleteSourceFileRef.current = e.target.checked; } }
            >
              同时删除源文件
            </Checkbox>
          </>
        ),
        onOk:async () => {
          await deleteModalMutation.mutateAsync({ id })
            .then(async () => {
              deleteSourceFileRef.current &&
              await Promise.all(paths.map((x) => {
                deleteSourceFileMutation.mutateAsync({
                  target: "DIR",
                  clusterId,
                  path:x,
                });
              }));
            })
            .then(() => {
              message.success("删除算法成功");
              refetch();
            });
        },
      });
    },
    [],
  );

  const getCurrentCluster = useCallback((clusterId: string) => {
    return clusters.find((c) => c.id === clusterId);
  }, [clusters]);

  const columns: TableColumnsType<ModalInterface> = [
    { dataIndex: "name", title: "名称" },
    { dataIndex: "clusterId", title: "集群",
      render: (_, r) =>
        getI18nConfigCurrentText(getCurrentCluster(r.clusterId)?.name, undefined) ?? r.clusterId },
    { dataIndex: "description", title: "模型描述" },
    { dataIndex: "algorithmName", title: "算法名称" },
    { dataIndex: "algorithmFramework", title: "算法框架" },
    { dataIndex: "versions", title: "版本数量", render:(_) => _.length },
    isPublic ? { dataIndex: "owner", title: "分享者" } : {},
    { dataIndex: "createTime", title: "创建时间",
      render:(_) => formatDateTime(_),
    },
    { dataIndex: "action", title: "操作",
      render: (_, r) => {
        return !isPublic ?
          (
            <>
              <CreateVersionModalButton
                refetch={() => { refetch(); setModalId(0); } }
                modalId={r.id}
                modalName={r.name}
                cluster={getCurrentCluster(r.clusterId)}
              >
                创建新版本
              </CreateVersionModalButton>
              <Button
                type="link"
                onClick={() =>
                { setVersionListModalIsOpen(true); setModalId(r.id);
                  setModalName(r.name); setCluster(getCurrentCluster(r.clusterId)); }}
              >
                  版本列表
              </Button>
              <EditModalModalButton
                refetch={refetch}
                editData={{
                  cluster:getCurrentCluster(r.clusterId),
                  modalId:r.id,
                  modalName:r.name,
                  algorithmName:r.algorithmName,
                  algorithmFramework:r.algorithmFramework,
                  modalDescription:r.description,
                }}
              >
                编辑
              </EditModalModalButton>
              <Button
                type="link"
                onClick={() => {
                  deleteModal(r.id, r.name, r.versions, r.clusterId);
                }}
              >
                删除
              </Button>
            </>
          ) :
          (
            <Button
              type="link"
              onClick={() =>
              { setVersionListModalIsOpen(true); setModalId(r.id);
                setModalName(r.name); setCluster(getCurrentCluster(r.clusterId)); }}
            >
              版本列表
            </Button>
          );
      },
    },
  ];

  return (
    <div>
      <FilterFormContainer style={{ display: "flex", justifyContent: "space-between" }}>
        <Form<FilterForm>
          layout="inline"
          form={form}
          initialValues={query}
          onFinish={async () => {
            const { nameOrDesc } = await form.validateFields();
            setQuery({ ...query, nameOrDesc: nameOrDesc?.trim() });
            setPageInfo({ page: 1, pageSize: pageInfo.pageSize });
          }}
        >
          <Form.Item label="集群" name="clusterId">
            <SingleClusterSelector
              allowClear={true}
              onChange={(val) => {
                setQuery({ ...query, clusterId:val.id });
              }}
            />
          </Form.Item>
          <Form.Item name="nameOrDesc">
            <Input allowClear placeholder="名称或描述" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">搜索</Button>
          </Form.Item>
        </Form>
        {!isPublic && (
          <Space>
            <CreateModalModalButton refetch={refetch}>添加</CreateModalModalButton>
          </Space>
        )}
      </FilterFormContainer>
      <Table
        rowKey="id"
        dataSource={data?.items}
        loading={isFetching}
        columns={columns.filter((x) => Object.keys(x).length)}
        pagination={{
          current: pageInfo.page,
          defaultPageSize: 10,
          pageSize: pageInfo.pageSize,
          showSizeChanger: true,
          total: data?.count,
          onChange: (page, pageSize) => setPageInfo({ page, pageSize }),
        }}
        scroll={{ x: true }}
      />
      <VersionListModal
        open={versionListModalIsOpen}
        onClose={() => { setVersionListModalIsOpen(false); setModalId(0); }}
        isPublic={isPublic}
        modalName={modalName}
        modalId={modalId}
        modalVersionData={versionData?.items ?? []}
        isFetching={versionFetching}
        refetch={versionRefetch}
        cluster={cluster}
      />
      {/* antd中modal组件 */}
      {confirmModalHolder}
    </div>
  );
};

