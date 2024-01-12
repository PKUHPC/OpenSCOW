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
import { TRPCClientError } from "@trpc/client";
import { App, Button, Divider, Form, Input, Modal, Select, Space, Table } from "antd";
import { useCallback, useState } from "react";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { ModalButton } from "src/components/ModalLink";
import { DatasetTypeText, SceneTypeText } from "src/models/Dateset";
import { Cluster } from "src/server/trpc/route/config";
import { AppRouter } from "src/server/trpc/router";
import { formatDateTime } from "src/utils/datetime";
import { trpc } from "src/utils/trpc";

import { defaultClusterContext } from "../defaultClusterContext";
import { CreateEditDatasetModal } from "./CreateEditDatasetModal";
import { CreateEditDSVersionModal } from "./CreateEditDSVersionModal";
import { DatasetVersionsModal } from "./DatasetVersionsModal";

interface Props {
  isPublic: boolean;
  clusters: Cluster[];
}

const FilterType = {
  ALL: "全部",
  ...DatasetTypeText,
} as { [key: string]: string };

type FilterTypeKeys = Extract<keyof typeof FilterType, string>;

interface FilterForm {
  cluster?: Cluster | undefined,
  type?: FilterTypeKeys | undefined,
  nameOrDesc?: string | undefined,
  isShared?: boolean,
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
      isShared: isPublic,
    };
  });

  const [form] = Form.useForm<FilterForm>();
  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: 10 });

  const [datasetId, setDatasetId] = useState<number>(0);
  const [datasetName, setDatasetName] = useState<string>("");
  const [clusterId, setClusterId] = useState<string>("");
  const [versionListModalIsOpen, setVersionListModalIsOpen] = useState(false);

  const { data, refetch, isFetching, error } = trpc.dataset.list.useQuery({
    ...pageInfo, ...query, clusterId: query.cluster?.id,
  });
  if (error) {
    message.error("找不到数据集");
  }

  const { data: versionData,
    isFetching: versionFetching,
    refetch: versionRefetch,
    error: versionError }
    = trpc.dataset.versionList.useQuery({ datasetId: datasetId, isShared: isPublic }, {
      enabled:!!datasetId,
    });
  if (versionError) {
    message.error("找不到数据集版本");
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

  const getCurrentCluster = useCallback((clusterId: string) => {
    return clusters.find((c) => c.id === clusterId);
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
            setDatasetId(0);
            refetch();
          }}
        >
          <Form.Item label="集群" name="cluster">
            <SingleClusterSelector
              allowClear={true}
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
            render: (_, r) => formatDateTime(r.createTime) },
          { dataIndex: "action", title: "操作",
            render: (_, r) => {
              return !isPublic ?
                (
                  <>
                    <Space split={<Divider type="vertical" />}>
                      <CreateEditVersionModalButton
                        datasetId={r.id}
                        datasetName={r.name}
                        cluster={getCurrentCluster(r.clusterId)}
                        refetch={() => {
                          refetch();
                          setDatasetId(0);
                        }}

                      >
                        创建新版本
                      </CreateEditVersionModalButton>
                    </Space>
                    <Space split={<Divider type="vertical" />}>
                      <Button
                        type="link"
                        onClick={() =>
                        { setVersionListModalIsOpen(true);
                          setDatasetId(r.id);
                          setDatasetName(r.name);
                          setClusterId(r.clusterId);
                        }}
                      >
                        版本列表
                      </Button>
                    </Space>
                    <Space split={<Divider type="vertical" />}>
                      <EditDatasetModalButton refetch={refetch} isEdit={true} editData={r} clusters={clusters}>
                        编辑
                      </EditDatasetModalButton>
                    </Space>
                    <Space split={<Divider type="vertical" />}>
                      <Button
                        type="link"
                        onClick={() => {
                          deleteDataset(r.id);
                        }}
                      >
                        删除
                      </Button>
                    </Space>
                  </>
                ) :
                (
                  <Space split={<Divider type="vertical" />}>
                    <Button
                      type="link"
                      onClick={() =>
                      { setVersionListModalIsOpen(true);
                        setDatasetId(r.id);
                        setDatasetName(r.name);
                        setClusterId(r.clusterId);
                      }}
                    >
                      版本列表
                    </Button>
                  </Space>
                );
            },
          },
        ]}
        pagination={setPageInfo ? {
          current: pageInfo.page,
          defaultPageSize: 10,
          pageSize: pageInfo.pageSize,
          showSizeChanger: true,
          total: data?.count,
          onChange: (page, pageSize) => setPageInfo({ page, pageSize }),
        } : false}
        scroll={{ x: true }}
      />
      {getCurrentCluster(clusterId) ? (
        <DatasetVersionsModal
          open={versionListModalIsOpen}
          onClose={() => { setVersionListModalIsOpen(false); setDatasetId(0); }}
          isPublic={isPublic}
          datasetName={datasetName}
          cluster={getCurrentCluster(clusterId)!}
          datasetVersions={versionData?.items ?? []}
          isFetching={versionFetching}
          onRefetch={versionRefetch}
        />
      ) : undefined}
      {/* antd中modal组件 */}
      {confirmModalHolder}
    </div>
  );
};

