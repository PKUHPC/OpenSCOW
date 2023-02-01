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
import { splitSbatchArgs } from "src/models/job";
import { AccountSelector } from "src/pageComponents/job/AccountSelector";
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";
import { Cluster, publicConfig } from "src/utils/config";
import { firstPartition, getPartitionInfo } from "src/utils/jobForm";

interface Props {
  appId: string;
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


export const LaunchAppForm: React.FC<Props> = ({ appId }) => {

  const { message } = App.useApp();

  const { data } = useAsync({
    promiseFn: useCallback(async () => {
      const { appCustomFormAttributes } = await api.getAppAttributes({ query: { appId } })
        .httpError(404, () => { message.error("此应用不存在"); });
      return appCustomFormAttributes;
    },
    [appId]),
  });

  const [form] = Form.useForm<FormFields>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const allFormFields = await form.validateFields();
    const { cluster, coreCount, partition, qos, account, maxTime } = allFormFields;

    const customFormKeyValue: {[key: string]: string} = {};
    let sbatchOptions: string | undefined;
    if (data) {
      data.forEach((customFormAttribute) => {
        const customFormKey = customFormAttribute.name;
        if (customFormKey === "sbatchOptions") {
          sbatchOptions = allFormFields[customFormKey];
        }
        else customFormKeyValue[customFormKey] = allFormFields[customFormKey];
      });
    }

    const userSbatchOptions = sbatchOptions ? splitSbatchArgs(sbatchOptions) : [];

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
      userSbatchOptions,
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

  const defaultClusterStore = useStore(DefaultClusterStore);

  // set default
  useEffect(() => {
    const defaultCluster = defaultClusterStore.cluster;

    if (defaultCluster) {
      const [partition, info] = firstPartition(defaultCluster);
      form.setFieldsValue({
        cluster: defaultCluster,
        partition,
        qos: info?.qos?.[0],
      });
    }
  }, []);

  // if partition is no longer available, use the first partition of the cluster
  useEffect(() => {
    if (!cluster) {
      form.setFieldsValue({ partition: undefined });
      return;
    }
    if (!getPartitionInfo(cluster, partition)) {
      form.setFieldsValue({ partition: firstPartition(cluster)[0] });
    }
  }, [cluster, partition]);

  const currentPartitionInfo = useMemo(
    () => cluster ? getPartitionInfo(cluster, partition) : undefined,
    [cluster, partition],
  );

  const customFormItems = data?.map((item, index) => {

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

    return (
      <Form.Item
        key={`${item.name}+${index}`}
        label={item.label}
        name={item.name}
        rules={rules}
      >
        {inputItem}
      </Form.Item>
    );
  });

  return (
    <Form form={form} onFinish={onSubmit} initialValues={initialValues}>

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
          disabled={!currentPartitionInfo}
          options={cluster
            ? Object.keys(publicConfig.CLUSTERS_CONFIG[cluster.id].slurm.partitions)
              .map((x) => ({ label: x, value: x }))
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
