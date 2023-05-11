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

import { App, Button, Form, Input, InputNumber, Select, Spin } from "antd";
import { Rule } from "antd/es/form";
import Router from "next/router";
import { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { useStore } from "simstate";
import { api } from "src/apis";
import { SingleClusterSelector } from "src/components/ClusterSelector";
import { AccountSelector } from "src/pageComponents/job/AccountSelector";
import { AppCustomAttribute } from "src/pages/api/app/getAppMetadata";
import { Partition } from "src/pages/api/cluster";
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    const allFormFields = await form.validateFields();
    const { cluster, coreCount, partition, qos, account, maxTime } = allFormFields;

    const customFormKeyValue: {[key: string]: string} = {};
    attributes.forEach((customFormAttribute) => {
      const customFormKey = customFormAttribute.name;
      customFormKeyValue[customFormKey] = allFormFields[customFormKey];
    });

    setLoading(true);
    setIsSubmitting(true);
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
  const [currentPartitionInfo, setCurrentPartitionInfo] = useState<Partition | undefined>();
  const account = Form.useWatch("account", form) as string | undefined;

  const clusterInfoQuery = useAsync({
    promiseFn: useCallback(async () => cluster
      ? api.getClusterInfo({ query: { cluster:  cluster?.id } }) : undefined, [cluster]),
    onResolve: async (data) => {
      if (data) {

        setLoading(true);
        const clusterPartition = data.clusterInfo.slurm.partitions[0];
        const clusterPartitionCoreCount = clusterPartition.cores;
        setCurrentPartitionInfo(clusterPartition);

        if (cluster) { await api.getAppLastSubmission({ query: { cluster: cluster?.id, appId } })
          .then((lastSubmitData) => {

            const lastSubmitPartition = lastSubmitData?.lastSubmissionInfo?.partition;
            const lastSubmitQos = lastSubmitData?.lastSubmissionInfo?.qos;
            const lastSubmitCoreCount = lastSubmitData?.lastSubmissionInfo?.coreCount;

            // 如果存在上一次提交信息，且上一次提交信息中的分区，qos，cpu核心数满足当前集群配置，则填入上一次提交信息中的相应值
            const setSubmitPartition = lastSubmitPartition &&
            data.clusterInfo.slurm.partitions.some((item) => { return item.name === lastSubmitPartition; });
            const setSubmitQos = setSubmitPartition &&
              clusterPartition.qos?.some((item) => { return item === lastSubmitQos; });
            const setSubmitCoreCount = setSubmitPartition &&
              lastSubmitCoreCount && clusterPartitionCoreCount && clusterPartitionCoreCount >= lastSubmitCoreCount;

            const requiredObj = {
              partition: setSubmitPartition ? lastSubmitPartition : clusterPartition.name,
              qos: setSubmitQos ? lastSubmitQos : clusterPartition?.qos?.[0],
              coreCount: setSubmitCoreCount ? lastSubmitCoreCount : initialValues.coreCount,
              maxTime: lastSubmitData?.lastSubmissionInfo
                ? lastSubmitData.lastSubmissionInfo.maxTime : initialValues.maxTime,
            };

            // 如果存在上一次提交信息且上一次提交信息中的配置HTML表单与当前配置HTML表单内容相同，则填入上一次提交信息中的值
            const attributesObj = {};
            const lastSubmitAttributes = lastSubmitData?.lastSubmissionInfo?.customAttributes;
            if (lastSubmitAttributes) {
              attributes.forEach((attribute) => {
                if (attribute.name in lastSubmitAttributes) {
                  switch (attribute.type) {
                  case "NUMBER":
                  case "TEXT":
                    attributesObj[attribute.name] = lastSubmitAttributes[attribute.name];
                    break;
                  case "SELECT":
                    if (attribute.select!.some((optionItem) =>
                      optionItem.value === lastSubmitAttributes[attribute.name])) {
                      attributesObj[attribute.name] = lastSubmitAttributes[attribute.name];
                    }
                    break;
                  default:
                    break;
                  }
                }
              });
            }
            form.setFieldsValue({ ...requiredObj, ...attributesObj });

            // 如果上一次提交信息存在，则填入账户值
            form.setFieldValue("account", lastSubmitData?.lastSubmissionInfo
              ? lastSubmitData?.lastSubmissionInfo.account : undefined);

          }).finally(() => {
            setLoading(false);
          });
        }
      }
    },
  });

  const handlePartitionChange = (partition) => {
    const partitionInfo = clusterInfoQuery.data
      ? clusterInfoQuery.data.clusterInfo.slurm.partitions.find((x) => x.name === partition)
      : undefined;
    form.setFieldValue("qos", partitionInfo?.qos?.[0]);
    setCurrentPartitionInfo(partitionInfo);
  };

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

    return (
      <Form.Item
        key={`${item.name}+${index}`}
        label={item.label}
        name={item.name}
        rules={rules}
        initialValue={item.defaultValue}
      >
        {inputItem}
      </Form.Item>
    );
  });

  const defaultClusterStore = useStore(DefaultClusterStore);

  return (
    <Form form={form} onFinish={onSubmit} initialValues={{ cluster: defaultClusterStore.cluster }}>

      <Form.Item name="cluster" label="集群" rules={[{ required: true }]}>
        <SingleClusterSelector />
      </Form.Item>

      <Spin spinning={loading} tip={isSubmitting ? "" : "查询上次提交记录中"}>

        <Form.Item
          label="账户"
          name="account"
          rules={[{ required: true }]}
          dependencies={["cluster"]}
        >
          {account && <AccountSelector cluster={cluster?.id} />}
        </Form.Item>

        <Form.Item
          label="分区"
          name="partition"
          dependencies={["cluster"]}
          rules={[{ required: true }]}
        >
          <Select
            disabled={!currentPartitionInfo}
            options={clusterInfoQuery.data
              ? clusterInfoQuery.data.clusterInfo.slurm.partitions
                .map((x) => ({ label: x.name, value: x.name }))
              : []
            }
            onChange={handlePartitionChange}
          />
        </Form.Item>

        <Form.Item
          label="QOS"
          name="qos"
          dependencies={["cluster"]}
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
          dependencies={["cluster"]}
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

      </Spin>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};
