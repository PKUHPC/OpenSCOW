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
import dayjs from "dayjs";
import Router from "next/router";
import { useCallback, useState } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { AccountSelector } from "src/pageComponents/job/AccountSelector";
import { AppCustomAttribute } from "src/pages/api/app/getAppMetadata";
import { Partition } from "src/pages/api/cluster";
import { formatSize } from "src/utils/format";

interface Props {
  appId: string;
  clusterId: string;
  appName: string;
  attributes: AppCustomAttribute[];
}

interface FormFields {
  appJobName: string;
  partition: string | undefined;
  qos: string | undefined;
  nodeCount: number;
  coreCount: number;
  gpuCount: number | undefined;
  account: string;
  maxTime: number;
}

// 生成默认应用名称，命名规则为"当前应用名-年月日-时分秒"
const genAppJobName = (appName: string): string => {
  return `${appName}-${dayjs().format("YYYYMMDD-HHmmss")}`;
};

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

export const LaunchAppForm: React.FC<Props> = ({ clusterId, appId, attributes, appName }) => {

  const { message, modal } = App.useApp();

  const [form] = Form.useForm<FormFields>();
  const [loading, setLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const createErrorModal = (message: string) => modal.error({
    title: "创建应用失败",
    content: message,
  });

  const onSubmit = async () => {
    const allFormFields = await form.validateFields();
    const { appJobName, nodeCount, coreCount, gpuCount, partition, qos, account, maxTime } = allFormFields;

    const customFormKeyValue: {[key: string]: string} = {};
    attributes.forEach((customFormAttribute) => {
      const customFormKey = customFormAttribute.name;
      customFormKeyValue[customFormKey] = allFormFields[customFormKey];
    });

    setLoading(true);
    setIsSubmitting(true);
    await api.createAppSession({ body: {
      cluster: clusterId,
      appId,
      appJobName: appJobName,
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
      .httpError(409, (e) => {
        e.code === "SBATCH_FAILED" ? createErrorModal(e.message) : (() => { throw e; })();
      })
      .httpError(404, (e) => {
        e.code === "APP_NOT_FOUND" ? createErrorModal(e.message) : (() => { throw e; })();
      })
      .httpError(400, (e) => {
        e.code === "INVALID_INPUT" ? createErrorModal(e.message) : (() => { throw e; })();
      })
      .then(() => {
        message.success("创建成功！");
        Router.push(`/apps/${clusterId}/sessions`);
      }).finally(() => {
        setLoading(false);
      });
  };

  const [currentPartitionInfo, setCurrentPartitionInfo] = useState<Partition | undefined>();

  const clusterInfoQuery = useAsync({
    promiseFn: useCallback(async () => clusterId
      ? api.getClusterInfo({ query: { cluster:  clusterId } }) : undefined, []),
    onResolve: async (data) => {
      if (data) {
        setLoading(true);
        form.setFieldValue("appJobName", genAppJobName(appName));

        setCurrentPartitionInfo(data.clusterInfo.scheduler.partitions[0]);

        await api.getAppLastSubmission({ query: { cluster: clusterId, appId } })
          .then((lastSubmitData) => {
            const lastSubmitPartition = lastSubmitData?.lastSubmissionInfo?.partition;
            const lastSubmitQos = lastSubmitData?.lastSubmissionInfo?.qos;
            const lastSubmitCoreCount = lastSubmitData?.lastSubmissionInfo?.coreCount;
            const lastSubmissionNodeCount = lastSubmitData?.lastSubmissionInfo?.nodeCount;
            const lastSubmissionGpuCount = lastSubmitData?.lastSubmissionInfo?.gpuCount;

            // 如果存在上一次提交信息，且上一次提交信息中的分区，qos，cpu核心数满足当前集群配置，则填入上一次提交信息中的相应值
            const setSubmitPartition = lastSubmitPartition &&
            data.clusterInfo.scheduler.partitions.some((item) => { return item.name === lastSubmitPartition; });

            const clusterPartition = setSubmitPartition
              ? data.clusterInfo.scheduler.partitions.filter((item) => { return item.name === lastSubmitPartition; })[0]
              : data.clusterInfo.scheduler.partitions[0];
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
                    attributesObj[attribute.name] = parseInt(lastSubmitAttributes[attribute.name]);
                    break;
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
    },
  });

  const handlePartitionChange = (partition: string) => {
    const partitionInfo = clusterInfoQuery.data
      ? clusterInfoQuery.data.clusterInfo.scheduler.partitions.find((x) => x.name === partition)
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

  const nodeCount = Form.useWatch("nodeCount", form) as number;

  const coreCount = Form.useWatch("coreCount", form) as number;

  const gpuCount = Form.useWatch("gpuCount", form) as number;

  const memorySize = (currentPartitionInfo ?
    currentPartitionInfo.gpus ? nodeCount * gpuCount
    * Math.floor(currentPartitionInfo.cores / currentPartitionInfo.gpus)
    * Math.floor(currentPartitionInfo.memMb / currentPartitionInfo.cores) :
      nodeCount * coreCount * Math.floor(currentPartitionInfo.memMb / currentPartitionInfo.cores) : 0);
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
        ... initialValues,
      }}
    >
      <Spin spinning={loading} tip={isSubmitting ? "" : "查询上次提交记录中"}>
        <Form.Item name="appJobName" label="作业名" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="账户"
          name="account"
          rules={[{ required: true }]}
        >
          <AccountSelector cluster={clusterId} />
        </Form.Item>

        <Form.Item
          label="分区"
          name="partition"
          rules={[{ required: true }]}
        >
          <Select
            disabled={!currentPartitionInfo}
            options={clusterInfoQuery.data
              ? clusterInfoQuery.data.clusterInfo.scheduler.partitions
                .map((x) => ({ label: x.name, value: x.name }))
              : []
            }
            onChange={handlePartitionChange}
          />
        </Form.Item>

        <Form.Item
          label="QOS"
          name="qos"
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
          dependencies={["partition"]}
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
              dependencies={["partition"]}
              rules={[
                {
                  required: true,
                  type: "integer",
                  max: currentPartitionInfo?.gpus / currentPartitionInfo.nodes,
                },
              ]}
            >
              <InputNumber
                min={1}
                max={currentPartitionInfo?.gpus / currentPartitionInfo.nodes}
                {...inputNumberFloorConfig}
              />
            </Form.Item>
          ) : (
            <Form.Item
              label="单节点CPU核心数"
              name="coreCount"
              dependencies={["partition"]}
              rules={[
                { required: true,
                  type: "integer",
                  max: currentPartitionInfo ?
                    currentPartitionInfo.cores / currentPartitionInfo.nodes : undefined },
              ]}
            >
              <InputNumber
                min={1}
                max={currentPartitionInfo ?
                  currentPartitionInfo.cores / currentPartitionInfo.nodes : undefined }
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
        <Button
          onClick={() => Router.push(`/apps/${clusterId}/createApps`)}
          style={{ marginRight: "10px" }}
        >
          取消
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};
