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
import { TRPCClientError } from "@trpc/client";
import { App, Button, Form, Input, Modal, Select, Space, Table } from "antd";
import { useCallback, useState } from "react";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { ModalButton } from "src/components/ModalLink";
import { DatasetTypeText, SceneTypeText } from "src/models/Dateset";
import { Cluster } from "src/server/trpc/route/config";
import { DatasetInterface } from "src/server/trpc/route/dataset/dataset";
import { AppRouter } from "src/server/trpc/router";
import { formatDateTime } from "src/utils/datetime";
import { parseBooleanParam } from "src/utils/parse";
import { trpc } from "src/utils/trpc";

import { defaultClusterContext } from "../defaultClusterContext";
import { CreateEditDatasetModal } from "./CreateEditDatasetModal";
import { CreateEditDSVersionModal } from "./CreateEditDSVersionModal";
import { DatasetVersionList } from "./DatasetVersionList";

interface Props {
  isPublic: boolean;
  clusters: Cluster[];
}

const FilterType = {
  ALL: "全部",
  ...DatasetTypeText,
} as Record<string, string>;

type FilterTypeKeys = Extract<keyof typeof FilterType, string>;

interface FilterForm {
  cluster?: Cluster | undefined,
  type?: FilterTypeKeys | undefined,
  nameOrDesc?: string | undefined,
}

interface PageInfo {
  page: number;
  pageSize?: number;
}

const CreateDatasetModalButton = ModalButton(CreateEditDatasetModal, { type: "primary", icon: <PlusOutlined /> });
const EditDatasetModalButton = ModalButton(CreateEditDatasetModal, { type: "link" });
const CreateEditVersionModalButton = ModalButton(CreateEditDSVersionModal, { type: "link" });

export const DatasetListTable: React.FC<Props> = ({ isPublic, clusters }) => {

  const [{ confirm }, confirmModalHolder] = Modal.useModal();

  const { message } = App.useApp();

  const { defaultCluster } = defaultClusterContext(clusters);

  const [query, setQuery] = useState<FilterForm>(() => {
    return {
      cluster: defaultCluster,
      nameOrDesc: undefined,
      type: undefined,
    };
  });

  const [form] = Form.useForm<FilterForm>();
  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: 10 });

  const { data, refetch, isFetching, error } = trpc.dataset.list.useQuery({
    ...pageInfo, ...query, clusterId: query.cluster?.id, isPublic: parseBooleanParam(isPublic),
  });
  if (error) {
    message.error("找不到数据集");
  }

  const deleteDatasetMutation = trpc.dataset.deleteDataset.useMutation({
    onSuccess() {
      refetch();
      message.success("删除成功");
    },
    onError: (err) => {
      const { data } = err as TRPCClientError<AppRouter>;
      if (data?.code === "NOT_FOUND") {
        message.error("找不到数据集");
      } else {
        message.error("删除数据集失败");
      }
    },
  });

  const deleteDataset = useCallback(
    (id: number) => {
      confirm({
        title: "删除数据集",
        onOk: async () => {
          await deleteDatasetMutation.mutateAsync({ id });
        },
      });
    },
    [],
  );

  const getCurrentCluster = useCallback((clusterId: string | undefined) => {
    if (clusterId) {
      return clusters.find((c) => c.id === clusterId);
    }
  }, [clusters]);

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
            refetch();
          }}
        >
          <Form.Item label="集群" name="cluster">
            <SingleClusterSelector
              allowClear={true}
              onChange={(value) => { setQuery({ ...query, cluster: value }); }}
            />
          </Form.Item>
          <Form.Item label="数据类型" name="type">
            <Select
              style={{ minWidth: "100px" }}
              allowClear
              onChange={(value: FilterTypeKeys) => {
                setQuery({ ...query, type: value === "ALL" ? undefined : value });
              }}
              placeholder="请选择数据类型"
              defaultValue={FilterType.ALL}
              options={
                Object.entries(FilterType).map(([key, value]) => ({ label:value, value:key }))}
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
            <CreateDatasetModalButton
              refetch={refetch}
              isEdit={false}
              clusters={clusters}
            >
              添加
            </CreateDatasetModalButton>
          </Space>
        )}
      </FilterFormContainer>
      <Table
        rowKey="id"
        dataSource={data?.items}
        loading={isFetching}
        columns={[
          { dataIndex: "name", title: "名称" },
          { dataIndex: "clusterId", title: "集群",
            render: (_, r) =>
              getI18nConfigCurrentText(getCurrentCluster(r.clusterId)?.name, undefined) ?? r.clusterId },
          { dataIndex: "type", title: "数据集类型",
            render: (_, r) => DatasetTypeText[r.type] },
          { dataIndex: "description", title: "数据集描述" },
          { dataIndex: "scene", title: "应用场景",
            render: (_, r) => SceneTypeText[r.scene] },
          { dataIndex: "versions", title: "版本数量",
            render: (_, r) => r.versions.length },
          isPublic ? { dataIndex: "shareUser", title: "分享者",
            render: (_, r) => r.owner } : {},
          { dataIndex: "createTime", title: "创建时间",
            render: (_, r) => r.createTime ? formatDateTime(r.createTime) : "-" },
          ...!isPublic ? [{ dataIndex: "action", title: "操作",
            render: (_: any, r: DatasetInterface) => {
              return (
                <>
                  <CreateEditVersionModalButton
                    datasetId={r.id}
                    datasetName={r.name}
                    cluster={getCurrentCluster(r.clusterId)}
                    refetch={() => {
                      refetch();
                    }}
                  >
                    创建新版本
                  </CreateEditVersionModalButton>
                  <EditDatasetModalButton refetch={refetch} isEdit={true} editData={r} clusters={clusters}>
                    编辑
                  </EditDatasetModalButton>
                  <Button
                    type="link"
                    onClick={() => {
                      deleteDataset(r.id);
                    }}
                  >
                    删除
                  </Button>
                </>
              );
            },
          }] : [],
        ]}
        pagination={setPageInfo ? {
          current: pageInfo.page,
          defaultPageSize: 10,
          pageSize: pageInfo.pageSize,
          showSizeChanger: true,
          total: data?.count,
          onChange: (page, pageSize) => setPageInfo({ page, pageSize }),
        } : false}
        expandable={{
          expandedRowRender: (record) => {
            const cluster = getCurrentCluster(record.clusterId);
            return cluster && (
              <DatasetVersionList
                isPublic={isPublic}
                datasets={data?.items ?? []}
                datasetId={record.id}
                datasetName={record.name}
                cluster={cluster}
              ></DatasetVersionList>
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

