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

"use client";

import { PlusOutlined } from "@ant-design/icons";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { App, Button, Form, Input, Modal, Space, Table, TableColumnsType } from "antd";
import { useCallback, useState } from "react";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { ModalButton } from "src/components/ModalLink";
import { ModelInterface } from "src/models/Model";
import { Cluster } from "src/server/trpc/route/config";
import { formatDateTime } from "src/utils/datetime";
import { parseBooleanParam } from "src/utils/parse";
import { trpc } from "src/utils/trpc";

import { CreateAndEditModalModal } from "./CreateAndEditModelModal";
import { CreateAndEditVersionModal } from "./CreateAndEditVersionModal";
import { ModelVersionList } from "./ModelVersionList";

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

  const { data, isFetching, refetch, error } = trpc.model.list.useQuery(
    { ...pageInfo,
      nameOrDesc:query.nameOrDesc,
      clusterId:query.clusterId,
      isPublic: parseBooleanParam(isPublic),
    });
  if (error) {
    message.error("找不到模型");
  }

  const deleteModelMutation = trpc.model.deleteModel.useMutation({
    onSuccess() {
      message.success("删除算法成功");
      refetch();
    },
    onError() {
      message.error("删除模型失败");
    },
  });

  const deleteModel = useCallback(
    async (id: number) => {
      confirm({
        title: "删除模型",
        onOk:async () => {
          await deleteModelMutation.mutateAsync({ id });
        },
      });
    },
    [],
  );

  const getCurrentCluster = useCallback((clusterId: string) => {
    return clusters.find((c) => c.id === clusterId);
  }, [clusters]);

  const columns: TableColumnsType<ModelInterface> = [
    { dataIndex: "name", title: "名称" },
    { dataIndex: "clusterId", title: "集群",
      render: (_, r) =>
        getI18nConfigCurrentText(getCurrentCluster(r.clusterId)?.name, undefined) ?? r.clusterId },
    { dataIndex: "description", title: "模型描述" },
    { dataIndex: "algorithmName", title: "算法名称" },
    { dataIndex: "algorithmFramework", title: "算法框架" },
    { dataIndex: "versions", title: "版本数量", render:(versions) => versions.length },
    isPublic ? { dataIndex: "owner", title: "分享者" } : {},
    { dataIndex: "createTime", title: "创建时间",
      render:(createTime) => formatDateTime(createTime),
    },
    ...!isPublic ? [{ dataIndex: "action", title: "操作",
      render: (_: any, r: ModelInterface) => {
        return (
          <>
            <CreateVersionModalButton
              refetch={() => { refetch(); } }
              modelId={r.id}
              modelName={r.name}
              cluster={getCurrentCluster(r.clusterId)}
            >
              创建新版本
            </CreateVersionModalButton>
            <EditModalModalButton
              refetch={refetch}
              editData={{
                cluster:getCurrentCluster(r.clusterId),
                modelId:r.id,
                modelName:r.name,
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
                deleteModel(r.id);
              }}
            >
              删除
            </Button>
          </>
        );
      },
    }] : [],
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
        expandable={{
          expandedRowRender: (record) => {
            const cluster = getCurrentCluster(record.clusterId);
            return cluster && (
              <ModelVersionList
                isPublic={isPublic}
                models={data?.items ?? []}
                modelId={record.id}
                modelName={record.name}
                cluster={cluster}
              ></ModelVersionList>
            );
          },
        }}
        scroll={{ x: true }}
      />


      {/* antd中modal组件 */}
      {confirmModalHolder}
    </div>
  );
};

