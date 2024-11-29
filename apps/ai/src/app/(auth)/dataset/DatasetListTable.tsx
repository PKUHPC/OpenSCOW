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
import { App, Button, Form, Input, Modal, Select, Space, Table } from "antd";
import { useCallback, useState } from "react";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { ModalButton } from "src/components/ModalLink";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { DatasetTypeText, getDatasetTexts } from "src/models/Dateset";
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
  currentClusterIds: string[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FilterTypeForKeys = {
  ALL: "全部",
  ...DatasetTypeText,
} as Record<string, string>;

type FilterTypeKeys = Extract<keyof typeof FilterTypeForKeys, string>;

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

export const DatasetListTable: React.FC<Props> = ({ isPublic, clusters, currentClusterIds }) => {
  const t = useI18nTranslateToString();
  const pModel = prefix("app.dataset.model.");
  const p = prefix("app.dataset.datasetListTable.");
  const languageId = useI18n().currentLanguage.id;

  // 本来应该是放在组件外，但是为了国际化将其放入组件中
  const FilterType = {
    ALL: t(pModel("all")),
    IMAGE: t(pModel("image")),
    TEXT: t(pModel("text")),
    VIDEO: t(pModel("video")),
    AUDIO: t(pModel("audio")),
    OTHER: t(pModel("other")),
  } as Record<string, string>;

  const SceneTypeText: Record<string, string> = {
    CWS:t(pModel("ces")),
    DA:t(pModel("da")),
    IC:t(pModel("ic")),
    OD:t(pModel("od")),
    OTHER:t(pModel("other")),
  };
  const DatasetTypeTextTrans: Record<string, string> = {
    IMAGE: getDatasetTexts(t).image,
    TEXT: getDatasetTexts(t).text,
    VIDEO: getDatasetTexts(t).video,
    AUDIO: getDatasetTexts(t).audio,
    OTHER: getDatasetTexts(t).other,
  };
  const [{ confirm }, confirmModalHolder] = Modal.useModal();

  const { message } = App.useApp();

  const { defaultCluster } = defaultClusterContext(clusters, currentClusterIds);

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
    message.error(t(p("notFound")));
  }

  const deleteDatasetMutation = trpc.dataset.deleteDataset.useMutation({
    onSuccess() {
      refetch();
      message.success(t(p("deleteSuccessfully")));
    },
    onError: (err) => {
      const { data } = err as TRPCClientError<AppRouter>;
      if (data?.code === "NOT_FOUND") {
        message.error(t(p("notFound")));
      } else {
        message.error(t(p("deleteFailed")));
      }
    },
  });

  const deleteDataset = useCallback(
    (id: number) => {
      confirm({
        title: t(p("delete")),
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
          <Form.Item label={t(p("cluster"))} name="cluster">
            <SingleClusterSelector
              allowClear={true}
              onChange={(value) => { setQuery({ ...query, cluster: value }); }}
            />
          </Form.Item>
          <Form.Item label={t(p("type"))} name="type">
            <Select
              style={{ minWidth: "100px" }}
              allowClear
              onChange={(value: FilterTypeKeys) => {
                setQuery({ ...query, type: value === "ALL" ? undefined : value });
              }}
              placeholder={t(p("selectType"))}
              defaultValue={FilterType.ALL}
              options={
                Object.entries(FilterType).map(([key, value]) => ({ label:value, value:key }))}
            />
          </Form.Item>
          <Form.Item name="nameOrDesc">
            <Input allowClear placeholder={t(p("nameOrDesc"))} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">{t("button.searchButton")}</Button>
          </Form.Item>
        </Form>
        {!isPublic && (
          <Space>
            <CreateDatasetModalButton
              refetch={refetch}
              isEdit={false}
              clusters={clusters}
              currentClusterIds={currentClusterIds}
            >
              {t("button.addButton")}
            </CreateDatasetModalButton>
          </Space>
        )}
      </FilterFormContainer>
      <Table
        rowKey="id"
        dataSource={data?.items}
        loading={isFetching}
        columns={[
          { dataIndex: "name", title: t(p("name")) },
          { dataIndex: "clusterId", title: t(p("cluster")),
            render: (_, r) =>
              getI18nConfigCurrentText(getCurrentCluster(r.clusterId)?.name, languageId) ?? r.clusterId },
          { dataIndex: "type", title: t(p("datasetType")),
            render: (_, r) => DatasetTypeTextTrans[r.type] },
          { dataIndex: "description", title: t(p("description")) },
          { dataIndex: "scene", title: t(p("scene")),
            render: (_, r) => SceneTypeText[r.scene] },
          { dataIndex: "versions", title: t(p("versions")),
            render: (_, r) => r.versions.length },
          isPublic ? { dataIndex: "shareUser", title: t(p("shareUser")),
            render: (_, r) => r.owner } : {},
          { dataIndex: "createTime", title: t(p("createTime")),
            render: (_, r) => r.createTime ? formatDateTime(r.createTime) : "-" },
          ...!isPublic ? [{ dataIndex: "action", title: t(p("action")),
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
                    {t(p("createNewVersion"))}
                  </CreateEditVersionModalButton>
                  <EditDatasetModalButton
                    refetch={refetch}
                    isEdit={true}
                    editData={r}
                    clusters={clusters}
                    currentClusterIds={currentClusterIds}
                  >
                    {t("button.editButton")}
                  </EditDatasetModalButton>
                  <Button
                    type="link"
                    onClick={() => {
                      deleteDataset(r.id);
                    }}
                  >
                    {t("button.deleteButton")}
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

