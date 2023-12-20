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
import { TRPCClientError } from "@trpc/client";
import { App, Button, Divider, Form, Input, Select, Space, Table } from "antd";
import NextError from "next/error";
import { useState } from "react";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { ModalButton } from "src/components/ModalLink";
import { DatasetTypeText, SceneTypeText } from "src/models/Dateset";
import { AppRouter } from "src/server/trpc/router";
import { trpc } from "src/utils/trpc";

import { CreateEditDatasetModal } from "./CreateEditDatasetModal";
import { CreateEditDVersionModal } from "./CreateEditDVersionModal";
import { DatasetVersionsModal } from "./DatasetVersionsModal";

interface Props {
  isPublic: boolean;
}

const FilterType = {
  ALL: "全部",
  ...DatasetTypeText,
} as { [key: string]: string };

type FilterTypeKeys = Extract<keyof typeof FilterType, string>;

interface FilterForm {
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
const CreateEditDVersionModalButton = ModalButton(CreateEditDVersionModal, { type: "link" });
const DatasetVersionsModalButton = ModalButton(DatasetVersionsModal, { type: "link" });

export const DatasetListTable: React.FC<Props> = ({ isPublic }) => {

  const [query, setQuery] = useState<FilterForm>(() => {
    return {
      nameOrDesc: undefined,
      type: undefined,
      isShared: isPublic,
    };
  });

  const [form] = Form.useForm<FilterForm>();

  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: 10 });

  console.log(3333333, query, pageInfo);
  const { data, refetch, isFetching, error, status } = trpc.dataset.list.useQuery({
    ...pageInfo, ...query,
  });

  const { modal, message } = App.useApp();


  if (error) {
    return (
      <NextError
        title={error.message}
        statusCode={error.data?.httpStatus ?? 500}
      />
    );
  }

  // if (status !== "success") {
  //   message.error("找不到数据集");
  // }

  const deleteDatasetMutation = trpc.dataset.deleteDataset.useMutation({
    onError: (err) => {
      const { data } = err as TRPCClientError<AppRouter>;
      if (data?.code === "NOT_FOUND") {
        message.error("找不到该数据集");
      }
    },
  });

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
          <Form.Item label="数据类型" name="type">
            <Select
              style={{ minWidth: "100px" }}
              allowClear
              onChange={(value: FilterTypeKeys) => {
                setQuery({ ...query, type: value === "ALL" ? undefined : value });
              }}
              placeholder="请选择数据类型"
              defaultValue={FilterType.ALL}
            >
              {Object.entries(FilterType).map(([key, value]) => (
                <Select.Option key={key} value={key}>
                  {value}
                </Select.Option>
              ))}
            </Select>
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
            <CreateDatasetModalButton isEdit={false}> 添加 </CreateDatasetModalButton>
          </Space>
        )}
      </FilterFormContainer>
      <Table
        rowKey="id"
        dataSource={data?.items}
        loading={isFetching}
        columns={[
          { dataIndex: "name", title: "名称" },
          { dataIndex: "type", title: "数据集类型",
            render: (_, r) => DatasetTypeText[r.type] },
          { dataIndex: "description", title: "数据集描述" },
          { dataIndex: "scene", title: "应用场景",
            render: (_, r) => SceneTypeText[r.scene] },
          { dataIndex: "versions", title: "版本数量",
            render: (_, r) => r.versions.length },
          isPublic ? { dataIndex: "shareUser", title: "分享者",
            render: (_, r) => r.owner } : {},
          { dataIndex: "createTime", title: "创建时间" },
          { dataIndex: "action", title: "操作",
            render: (_, r) => {
              return !isPublic ?
                (
                  <>
                    <Space split={<Divider type="vertical" />}>
                      <CreateEditDVersionModalButton key='创建新版本' datasetId={r.id} datasetName={r.name}>
                        创建新版本
                      </CreateEditDVersionModalButton>
                    </Space>
                    <Space split={<Divider type="vertical" />}>
                      <DatasetVersionsModalButton key='版本列表' datasetId={r.id} datasetName={r.name}>
                        版本列表
                      </DatasetVersionsModalButton>
                    </Space>
                    <Space split={<Divider type="vertical" />}>
                      <EditDatasetModalButton isEdit={true} editData={r}>
                        编辑
                      </EditDatasetModalButton>
                    </Space>
                    <Space split={<Divider type="vertical" />}>
                      <Button
                        type="link"
                        onClick={() => {
                          modal.confirm({
                            title: "删除数据集",
                            content: `是否确认删除数据集${r.name}？如该数据集已分享，则分享的数据集也会被删除。`,
                            onOk: () => {
                              deleteDatasetMutation.mutate({
                                id: r.id,
                              }, {
                                onSuccess() {
                                  refetch();
                                  message.success("删除成功");
                                },
                              });
                            },
                          });
                        }}
                      >
                        删除
                      </Button>
                    </Space>
                  </>
                ) :
                (
                  <Space split={<Divider type="vertical" />}>
                    <CreateEditDVersionModalButton key='版本列表' datasetId={r.id} datasetName={r.name}>
                        版本列表
                    </CreateEditDVersionModalButton>
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
    </div>
  );
};

