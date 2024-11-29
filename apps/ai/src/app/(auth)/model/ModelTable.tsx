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
import { App, Button, Form, Input, Modal, Space, Table, TableColumnsType } from "antd";
import { useCallback, useState } from "react";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { ModalButton } from "src/components/ModalLink";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
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
  const t = useI18nTranslateToString();
  const p = prefix("app.model.modelTable.");
  const languageId = useI18n().currentLanguage.id;

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
    message.error(t(p("notFound")));
  }

  const deleteModelMutation = trpc.model.deleteModel.useMutation({
    onSuccess() {
      message.success(t(p("deleteSuccessfully")));
      refetch();
    },
    onError() {
      message.error(t(p("deleteFailed")));
    },
  });

  const deleteModel = useCallback(
    async (id: number) => {
      confirm({
        title: t(p("delete")),
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
    { dataIndex: "name", title: t(p("name")) },
    { dataIndex: "clusterId", title: t(p("cluster")),
      render: (_, r) =>
        getI18nConfigCurrentText(getCurrentCluster(r.clusterId)?.name, languageId) ?? r.clusterId },
    { dataIndex: "description", title: t(p("description")) },
    { dataIndex: "algorithmName", title: t(p("algorithmName")) },
    { dataIndex: "algorithmFramework", title: t(p("algorithmFramework")) },
    { dataIndex: "versions", title: t(p("versions")), render:(versions) => versions.length },
    isPublic ? { dataIndex: "owner", title: t(p("owner")) } : {},
    { dataIndex: "createTime", title: t(p("createTime")),
      render:(createTime) => formatDateTime(createTime),
    },
    ...!isPublic ? [{ dataIndex: "action", title: t(p("action")),
      render: (_: any, r: ModelInterface) => {
        return (
          <>
            <CreateVersionModalButton
              refetch={() => { refetch(); } }
              modelId={r.id}
              modelName={r.name}
              cluster={getCurrentCluster(r.clusterId)}
            >
              {t(p("createNewVersion"))}
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
              {t("button.editButton")}
            </EditModalModalButton>
            <Button
              type="link"
              onClick={() => {
                deleteModel(r.id);
              }}
            >
              {t("button.deleteButton")}
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
          <Form.Item label={t(p("cluster"))} name="clusterId">
            <SingleClusterSelector
              allowClear={true}
              onChange={(val) => {
                setQuery({ ...query, clusterId:val.id });
              }}
            />
          </Form.Item>
          <Form.Item name="nameOrDesc">
            <Input allowClear placeholder={t(p("nameOrDes"))} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">{t("button.searchButton")}</Button>
          </Form.Item>
        </Form>
        {!isPublic && (
          <Space>
            <CreateModalModalButton refetch={refetch}>{t("button.addButton")}</CreateModalModalButton>
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

