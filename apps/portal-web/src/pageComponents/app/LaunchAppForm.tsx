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

import { App, Button, Form, Input, InputNumber, Select } from "antd";
import { Rule } from "antd/es/form";
import Router from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { AccountSelector } from "src/pageComponents/job/AccountSelector";
import { AppCustomAttribute } from "src/pages/api/app/getAppMetadata";
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";
import { Cluster } from "src/utils/config";

interface Props {
  appId: string;
  appName: string;
  attributes: AppCustomAttribute[];
}

interface FormFields {
  cluster: Cluster;
  partition: string | undefined;
  qos: string | undefined;
  coreCount: number;
  account: string;
  maxTime: number;
}


const initialValues = {
  nodeCount: 1,
  coreCount: 1,
  maxTime: 60,
} as Partial<FormFields>;


export const LaunchAppForm: React.FC<Props> = ({ appId, attributes }) => {

  const { message } = App.useApp();

  const [form] = Form.useForm<FormFields>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const allFormFields = await form.validateFields();
    const { cluster, coreCount, partition, qos, account, maxTime } = allFormFields;

    const customFormKeyValue: {[key: string]: string} = {};
    attributes.forEach((customFormAttribute) => {
      const customFormKey = customFormAttribute.name;
      customFormKeyValue[customFormKey] = allFormFields[customFormKey];
    });

    setLoading(true);
    await api.createAppSession({ body: {
      cluster: cluster.id,
      appId,
      coreCount,
      partition,
      qos,
      account,
      maxTime,
      customAttributes: customFormKeyValue,
    } })
      .then(() => {
        message.success("创建成功！");
        Router.push("/apps/sessions");
      }).finally(() => {
        setLoading(false);
      });
  };

  const cluster = Form.useWatch("cluster", form) as Cluster | undefined;
  const partition = Form.useWatch("partition", form) as string | undefined;


  const clusterInfoQuery = useAsync({
    promiseFn: useCallback(async () => cluster
      ? api.getClusterInfo({ query: { cluster:  cluster?.id } }) : undefined, [cluster]),
    onResolve: (data) => {
      if (data) {
        const partition = data.clusterInfo.slurm.partitions[0];
        form.setFieldValue("partition", partition.name);
        form.setFieldValue("qos", partition.qos?.[0]);
      }
    },
  });

  const currentPartitionInfo = useMemo(() =>
    clusterInfoQuery.data
      ? clusterInfoQuery.data.clusterInfo.slurm.partitions.find((x) => x.name === partition)
      : undefined,
  [clusterInfoQuery.data, partition],
  );

  useEffect(() => {
    if (currentPartitionInfo) {
      form.setFieldValue("qos", currentPartitionInfo.qos?.[0]);
    }
  }, [currentPartitionInfo]);

  const customFormItems = attributes.map((item, index) => {

    const rules: Rule[] = item.type === "NUMBER"
      ? [{ type: "integer" }, { required: item.required }]
      : [{ required: item.required }];

    const placeholder = item.placeholder ?? "";
    const inputItem = item.type === "NUMBER" ? (<InputNumber placeholder={placeholder} />)
      : item.type === "TEXT" ? (<Input placeholder={placeholder} />)
        : (
          <Select
            options={item.select.map((x) => ({ label: x.label, value: x.value }))}
            placeholder={placeholder}
          />
        );
    const initialValue = item.type === "SELECT" ? (item.defaultValue ?? item.select[0]) : item.defaultValue;

    return (
      <Form.Item
        key={`${item.name}+${index}`}
        label={item.label}
        name={item.name}
        rules={rules}
        initialValue={initialValue}
      >
        {inputItem}
      </Form.Item>
    );
  });

  const defaultClusterStore = useStore(DefaultClusterStore);

  return (
    <Form form={form} onFinish={onSubmit} initialValues={{ ...initialValues, cluster: defaultClusterStore.cluster }}>

      <Form.Item name="cluster" label="集群" rules={[{ required: true }]}>
        <SingleClusterSelector />
      </Form.Item>

      <Form.Item
        label="账户"
        name="account"
        rules={[{ required: true }]}
        dependencies={["cluster"]}
      >
        <AccountSelector cluster={cluster?.id} />
      </Form.Item>

      <Form.Item
        label="分区"
        name="partition"
        dependencies={["cluster"]}
        rules={[{ required: true }]}
      >
        <Select
          loading={clusterInfoQuery.isLoading}
          disabled={!currentPartitionInfo}
          options={clusterInfoQuery.data
            ? clusterInfoQuery.data.clusterInfo.slurm.partitions
              .map((x) => ({ label: x.name, value: x.name }))
            : []
          }
        />
      </Form.Item>

      <Form.Item
        label="QOS"
        name="qos"
        dependencies={["cluster", "partition"]}
        rules={[{ required: true }]}
      >
        <Select
          disabled={(!currentPartitionInfo?.qos) || currentPartitionInfo.qos.length === 0}
          options={currentPartitionInfo?.qos?.map((x) => ({ label: x, value: x }))}
        />
      </Form.Item>

      <Form.Item
        label="CPU核心数"
        name="coreCount"
        dependencies={["cluster", "partition"]}
        rules={[
          { required: true, type: "integer", max: currentPartitionInfo?.cores },
        ]}
      >
        <InputNumber min={1} />
      </Form.Item>

      <Form.Item label="最长运行时间" name="maxTime" rules={[{ required: true }]}>
        <InputNumber min={1} step={1} addonAfter={"分钟"} />
      </Form.Item>

      {customFormItems}

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};
