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
import { App, Button, Divider, Form, Input, Select, Space, Table } from "antd";
import NextError from "next/error";
import { useState } from "react";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { ModalButton } from "src/components/ModalLink";
import { DatasetTypeText } from "src/models/Dateset";
import { trpc } from "src/utils/trpc";

import { AddDatasetModal } from "./AddDatasetModal";
import { CreateDVersionModal } from "./CreateDVersionModal";

interface Props {
  isPublic: boolean;
}

const FilterType = {
  ALL: "全部",
  ...DatasetTypeText,
};
type FilterTypeKeys = keyof typeof FilterType;

interface FilterForm {
  owner?: string | undefined,
  type?: FilterTypeKeys | undefined,
  name?: string | undefined,
  description?: string | undefined,
}

interface PageInfo {
    page: number;
    pageSize?: number;
}

const AddDatasetModalButton = ModalButton(AddDatasetModal, { type: "primary", icon: <PlusOutlined /> });
const CreateDVersionModalButton = ModalButton(CreateDVersionModal, { type: "link" });

export const DatasetListTable: React.FC<Props> = ({ isPublic }) => {

  const [query, setQuery] = useState<FilterForm>(() => {
    return {
      owner: undefined,
      name: undefined,
      description: undefined,
      type: undefined,
    };
  });

  const [form] = Form.useForm<FilterForm>();

  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: 10 });

  const { data, isFetching, error, status } = trpc.dataset.list.useQuery({
    paginationSchema: pageInfo, filter: query,
  });

  const { message } = App.useApp();


  if (error) {
    return (
      <NextError
        title={error.message}
        statusCode={error.data?.httpStatus ?? 500}
      />
    );
  }

  if (status !== "success") {
    message.error("找不到数据集");
  }


  const setSelectedType = (value: any) => {
    console.log(value);
  };

  return (
    <div>
      <FilterFormContainer style={{ display: "flex", justifyContent: "space-between" }}>
        <Form<FilterForm>
          layout="inline"
          form={form}
          initialValues={query}
          onFinish={async () => {
            const { name, description } = await form.validateFields();
            setQuery({ ...query, name: name?.trim(), description: description?.trim() });
            setPageInfo({ page: 1, pageSize: pageInfo.pageSize });
          }}
        >
          <Form.Item label="数据类型" name="type">
            <Select
              style={{ minWidth: "100px" }}
              allowClear
              onChange={(value) => {
                setSelectedType(value);
              }}
              placeholder="请选择数据类型"
              defaultValue={FilterType.ALL}
            >
              {Object.entries(FilterType).map(([key, value]) => (
                <Select.Option key={key} value={value}>
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
            <AddDatasetModalButton owner="demo_admin"> 添加 </AddDatasetModalButton>
          </Space>
        )}
      </FilterFormContainer>
      <Table
        rowKey="id"
        dataSource={data?.items}
        loading={isFetching}
        columns={[
          { dataIndex: "name", title: "名称" },
          { dataIndex: "type", title: "数据集类型" },
          { dataIndex: "description", title: "数据集描述" },
          { dataIndex: "scene", title: "应用场景" },
          { dataIndex: "versions", title: "版本数量",
            render: (_, r) => {
              // return r.versions.length;
              return 1;
            } },
          isPublic ? { dataIndex: "shareUser", title: "分享者",
            render: (_, r) => {
              // return r.owner;
              return "demo_admin";
            } } : {},
          { dataIndex: "createTime", title: "创建时间" },
          { dataIndex: "action", title: "操作",
            render: (_, _r) => {
              return !isPublic ?
                (
                  <>
                    <Space split={<Divider type="vertical" />}>
                      <CreateDVersionModalButton key='创建新版本' datasetId={1} datasetName="aaaa">
                        创建新版本
                      </CreateDVersionModalButton>
                    </Space>
                    <Space split={<Divider type="vertical" />}>
                      <CreateDVersionModalButton key='版本列表' datasetId={1} datasetName="aaaa">
                        版本列表
                      </CreateDVersionModalButton>
                    </Space>
                    <Space split={<Divider type="vertical" />}>
                      <CreateDVersionModalButton key='编辑' datasetId={1} datasetName="aaaa">
                        编辑
                      </CreateDVersionModalButton>
                    </Space>
                    <Space split={<Divider type="vertical" />}>
                      <CreateDVersionModalButton key='删除' datasetId={1} datasetName="aaaa">
                        删除
                      </CreateDVersionModalButton>
                    </Space>
                  </>
                ) :
                (
                  <Space split={<Divider type="vertical" />}>
                    <CreateDVersionModalButton key='版本列表' datasetId={1} datasetName="aaaa">
                        版本列表
                    </CreateDVersionModalButton>
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
          // total: data?.count,
          total: 1,
          onChange: (page, pageSize) => setPageInfo({ page, pageSize }),
        } : false}
        scroll={{ x: true }}
      />
    </div>
  );
};

