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

import { App, Button, Col, Form, Input, InputNumber, Row, Select, Spin } from "antd";
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
import { formatSize } from "src/utils/format";

interface Props {
  appId: string;
  appName: string;
  attributes: AppCustomAttribute[];
}

interface FormFields {
  cluster: Cluster;
  partition: string | undefined;
  qos: string | undefined;
  nodeCount: number;
  coreCount: number;
  gpuCount: number | undefined;
  account: string;
  maxTime: number;
}

const initialValues = {
  nodeCount: 1,
  coreCount: 1,
  gpuCount: 1,
  maxTime: 60,
} as Partial<FormFields>;

const inputNumberFloorConfig = {
  formatter: (value: number) => `${Math.floor(value)}`,
  parser: (value: string) => Math.floor(+value),
};

export const LaunchAppForm: React.FC<Props> = ({ appId, attributes }) => {

  const { message } = App.useApp();

  const [form] = Form.useForm<FormFields>();
  const [loading, setLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    const allFormFields = await form.validateFields();
    const { cluster, nodeCount, coreCount, gpuCount, partition, qos, account, maxTime } = allFormFields;

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
      nodeCount: nodeCount,
      coreCount: gpuCount ? gpuCount * Math.floor(currentPartitionInfo!.cores / currentPartitionInfo!.gpus) : coreCount,
      gpuCount,
      memory,
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

  const clusterInfoQuery = useAsync({
    promiseFn: useCallback(async () => cluster
      ? api.getClusterInfo({ query: { cluster:  cluster?.id } }) : undefined, [cluster]),
    onResolve: async (data) => {
      if (data) {

        setLoading(true);
        setCurrentPartitionInfo(data.clusterInfo.slurm.partitions[0]);

        if (cluster) { await api.getAppLastSubmission({ query: { cluster: cluster?.id, appId } })
          .then((lastSubmitData) => {
            const lastSubmitPartition = lastSubmitData?.lastSubmissionInfo?.partition;
            const lastSubmitQos = lastSubmitData?.lastSubmissionInfo?.qos;
            const lastSubmitCoreCount = lastSubmitData?.lastSubmissionInfo?.coreCount;
            const lastSubmissionNodeCount = lastSubmitData?.lastSubmissionInfo?.nodeCount;
            const lastSubmissionGpuCount = lastSubmitData?.lastSubmissionInfo?.gpuCount;

            // 如果存在上一次提交信息，且上一次提交信息中的分区，qos，cpu核心数满足当前集群配置，则填入上一次提交信息中的相应值
            const setSubmitPartition = lastSubmitPartition &&
            data.clusterInfo.slurm.partitions.some((item) => { return item.name === lastSubmitPartition; });

            const clusterPartition = setSubmitPartition
              ? data.clusterInfo.slurm.partitions.filter((item) => { return item.name === lastSubmitPartition; })[0]
              : data.clusterInfo.slurm.partitions[0];
            setCurrentPartitionInfo(clusterPartition);

            const clusterPartitionCoreCount = clusterPartition.cores;
            const clusterPartitionNodeCount = clusterPartition.nodes;
            const clusterPartitionGpuCount = clusterPartition.gpus;

            const setSubmitQos = setSubmitPartition &&
              clusterPartition.qos?.some((item) => { return item === lastSubmitQos; });
            const setSubmitCoreCount = setSubmitPartition &&
              lastSubmitCoreCount && clusterPartitionCoreCount && clusterPartitionCoreCount >= lastSubmitCoreCount;
            const setSubmitNodeCount = setSubmitPartition &&
                lastSubmissionNodeCount && clusterPartitionNodeCount &&
                clusterPartitionNodeCount >= lastSubmissionNodeCount;

            const setSubmitGpuCount = setSubmitPartition && lastSubmissionGpuCount && clusterPartitionGpuCount &&
            clusterPartitionGpuCount >= lastSubmissionGpuCount;

            const requiredObj = {
              partition: setSubmitPartition ? lastSubmitPartition : clusterPartition.name,
              qos: setSubmitQos ? lastSubmitQos : clusterPartition?.qos?.[0],
              nodeCount: setSubmitNodeCount ? lastSubmissionNodeCount : initialValues.nodeCount,
              coreCount: setSubmitCoreCount ? lastSubmitCoreCount : initialValues.coreCount,
              gpuCount: setSubmitGpuCount ? lastSubmissionGpuCount : initialValues.gpuCount,
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
            if (lastSubmitData.lastSubmissionInfo) {
              form.setFieldValue("account", lastSubmitData.lastSubmissionInfo.account);
            }

          }).finally(() => {
            setLoading(false);
          });
        }
      }
    },
  });

  const handlePartitionChange = (partition: string) => {
    const partitionInfo = clusterInfoQuery.data
      ? clusterInfoQuery.data.clusterInfo.slurm.partitions.find((x) => x.name === partition)
      : undefined;
    form.setFieldValue("qos", partitionInfo?.qos?.[0]);
    if (!!partitionInfo?.gpus) {
      form.setFieldValue("gpuCount", 1);
    } else {
      form.setFieldValue("coreCount", 1);
    }
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
    const initialValue = item.type === "SELECT" ? (item.defaultValue ?? item.select[0].value) : item.defaultValue;

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

  const nodeCount = Form.useWatch("nodeCount", form) as number;

  const coreCount = Form.useWatch("coreCount", form) as number;

  const gpuCount = Form.useWatch("gpuCount", form) as number;

  const memorySize = (currentPartitionInfo ?
    currentPartitionInfo.gpus ? nodeCount * gpuCount
    * Math.floor(currentPartitionInfo.cores / currentPartitionInfo.gpus)
    * Math.floor(currentPartitionInfo.mem / currentPartitionInfo.cores) :
      nodeCount * coreCount * Math.floor(currentPartitionInfo.mem / currentPartitionInfo.cores) : 0);
  const memory = memorySize + "MB";
  const memoryDisplay = formatSize(memorySize, ["MB", "GB", "TB"]);

  const coreCountSum = currentPartitionInfo?.gpus
    ? nodeCount * gpuCount * Math.floor(currentPartitionInfo.cores / currentPartitionInfo.gpus)
    : nodeCount * coreCount;

  return (
    <Form
      form={form}
      onFinish={onSubmit}
      initialValues={{
        cluster: defaultClusterStore.cluster, ... initialValues,
      }}
    >
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
          label="节点数"
          name="nodeCount"
          dependencies={["cluster", "partition"]}
          rules={[
            { required: true, type: "integer", max: currentPartitionInfo?.nodes },
          ]}
        >
          <InputNumber
            min={1}
            max={currentPartitionInfo?.nodes}
            {...inputNumberFloorConfig}
          />
        </Form.Item>
        {
          currentPartitionInfo?.gpus ? (
            <Form.Item
              label="单节点GPU卡数"
              name="gpuCount"
              dependencies={["cluster", "partition"]}
              rules={[
                {
                  required: true,
                  type: "integer",
                  max: currentPartitionInfo?.gpus,
                },
              ]}
            >
              <InputNumber
                min={1}
                max={currentPartitionInfo?.gpus}
                {...inputNumberFloorConfig}
              />
            </Form.Item>
          ) : (
            <Form.Item
              label="单节点CPU核心数"
              name="coreCount"
              dependencies={["cluster", "partition"]}
              rules={[
                { required: true, type: "integer", max: currentPartitionInfo?.cores },
              ]}
            >
              <InputNumber
                min={1}
                max={currentPartitionInfo?.cores}
                {...inputNumberFloorConfig}
              />
            </Form.Item>
          )
        }
        <Form.Item label="最长运行时间" name="maxTime" rules={[{ required: true }]}>
          <InputNumber min={1} step={1} addonAfter={"分钟"} />
        </Form.Item>

        {customFormItems}
        <Row>
          {
            currentPartitionInfo?.gpus
              ?
              (
                <Col span={12} sm={6}>
                  <Form.Item label="总GPU卡数">
                    {nodeCount * gpuCount}
                  </Form.Item>
                </Col>
              ) : null
          }
          <Col span={12} sm={6}>
            <Form.Item label="总CPU核心数">
              {coreCountSum}
            </Form.Item>
          </Col>
          <Col span={12} sm={6}>
            <Form.Item label="总内存容量">
              {memoryDisplay}
            </Form.Item>
          </Col>
        </Row>
      </Spin>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};
