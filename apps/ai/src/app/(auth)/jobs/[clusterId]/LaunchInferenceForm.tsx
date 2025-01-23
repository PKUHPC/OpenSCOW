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

import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { App, Button, Checkbox, Col,
  Divider, Form, Input, InputNumber, Radio,Row, Select, Space, Spin } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AccountSelector } from "src/components/AccountSelector";
import { FileSelectModal } from "src/components/FileSelectModal";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { Status } from "src/models/Image";
import { ImageSource } from "src/models/Job";
import { ModelInterface, ModelVersionInterface } from "src/models/Model";
import { InferenceJobInput } from "src/server/trpc/route/jobs/infer";
import { formatSize } from "src/utils/format";
import { parseBooleanParam } from "src/utils/parse";
import { trpc } from "src/utils/trpc";

import { setEntityInitData, useDataOptions, useDataVersionOptions } from "./hooks";

interface Props {
  clusterId: string;
  clusterInfo: ClusterConfig;
  InferenceJobInput?: InferenceJobInput
}

interface FixedFormFields {
  appJobName: string;
  imageSource: ImageSource;
  image: { type: AccessibilityType, name: number };
  remoteImageUrl: string | undefined;
  isUnlimitedTime: boolean;
  showModel: boolean;
  model: { type: AccessibilityType, name: number, version: number };
  mountPoints: string[] | undefined;
  partition: string | undefined;
  coreCount: number;
  nodeCount: number;
  gpuCount: number | undefined;
  account: string;
  maxTime: number;
  containerServicePort: number;
  command?: string;
}

type FormFields = FixedFormFields;

interface ClusterConfig {
  partitions: Partition[];
  schedulerName: string,
}

interface Partition {
  name: string;
  memMb: number;
  cores: number;
  gpus: number;
  nodes: number;
  comment?: string;
  gpuType?: string;
}

export enum AccessibilityType {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

// 生成默认应用名称，命名规则为"集群名-当前应用名-年月日-时分秒"
const genAppJobName = (clusterId: string, appName: string): string => {
  return `${clusterId}-${appName}-${dayjs().format("YYYYMMDD-HHmmss")}`;
};

const initialValues = {
  nodeCount:1,
  coreCount: 1,
  gpuCount: 1,
  maxTime: 60,
  isUnlimitedTime:true,
} as Partial<FormFields>;

const inputNumberFloorConfig = {
  formatter: (value: number | undefined) => `${Math.floor(value ?? 0)}`,
  parser: (value: string | undefined) => Math.floor(value ? +value : 0),
};


export const LaunchInferenceJobForm = (props: Props) => {

  const t = useI18nTranslateToString();
  const p = prefix("app.jobs.launchAppForm.");
  const pInfer = prefix("app.jobs.LaunchInferenceForm.");

  const { clusterId, clusterInfo,InferenceJobInput } = props;

  const { message } = App.useApp();

  const router = useRouter();

  const [form] = Form.useForm<FormFields>();

  const [currentPartitionInfo, setCurrentPartitionInfo] = useState<Partition | undefined>();

  const showModel = Form.useWatch("showModel", form);
  const isUnlimitedTime = Form.useWatch("isUnlimitedTime", form);
  const imageSource = Form.useWatch("imageSource", form);

  const isModelPrivate = Form.useWatch(["model", "type"], form) === AccessibilityType.PRIVATE;

  const { data: models, dataOptions: modelOptions, isDataLoading:  isModelsLoading } = useDataOptions<ModelInterface>(
    form,
    "model",
    trpc.model.list.useQuery,
    clusterId,
    (x) => ({ label: `${x.name}(${x.owner})`, value: x.id }),
  );

  const {
    dataVersions: modelVersions,
    dataVersionOptions: modelVersionOptions,
    isDataVersionsLoading: isModelVersionsLoading,
    dataVersionDescription: modelVersionDescription,
  } =
  useDataVersionOptions<ModelVersionInterface>(
    form,
    "model",
    trpc.model.versionList.useQuery,
    (x) => ({ label: x.versionName, value: x.id }),
  );

  const imageType = Form.useWatch(["image", "type"], form);

  const isImagePublic = imageType !== undefined ? imageType === AccessibilityType.PUBLIC : imageType;

  const { data: images, isLoading: isImagesLoading } = trpc.image.list.useQuery({
    isPublic: isImagePublic !== undefined ? parseBooleanParam(isImagePublic) : undefined,
    clusterId,
    withExternal: "true",
  }, {
    enabled: isImagePublic !== undefined,
  });

  const imageOptions = useMemo(() => {
    return images?.items
      .filter((x) => x.status === Status.CREATED)
      .map((x) => ({ label: `${x.name}:${x.tag}`, value: x.id }));
  }, [images]);

  const imageDescription = useMemo(() => {
    const imageDescObj: Record<number,string | undefined> = {};

    images?.items.forEach((x) => {
      imageDescObj[x.id] = x.description;
    });

    return imageDescObj;
  }, [images]);

  const nodeCount = Form.useWatch("nodeCount", form);

  const coreCount = Form.useWatch("coreCount", form);

  const gpuCount = Form.useWatch("gpuCount", form)!;

  const imageId = Form.useWatch(["image", "name"], form);
  const modelVersionId = Form.useWatch(["model", "version"], form);

  const memorySize = (currentPartitionInfo ?
    currentPartitionInfo.gpus ? nodeCount * gpuCount
    * Math.floor(currentPartitionInfo.cores / currentPartitionInfo.gpus)
    * Math.floor(currentPartitionInfo.memMb / currentPartitionInfo.cores) :
      nodeCount * coreCount * Math.floor(currentPartitionInfo.memMb / currentPartitionInfo.cores) : 0);
  const memoryDisplay = formatSize(memorySize, ["MB", "GB", "TB"]);

  const coreCountSum = currentPartitionInfo?.gpus
    ? nodeCount * gpuCount * Math.floor(currentPartitionInfo.cores / currentPartitionInfo.gpus)
    : nodeCount * coreCount;


  const handlePartitionChange = (partition: string) => {
    const partitionInfo = clusterInfo
      ? clusterInfo.partitions.find((x) => x.name === partition)
      : undefined;
    if (partitionInfo?.gpus) {
      form.setFieldValue("gpuCount", 1);
    } else {
      form.setFieldValue("coreCount", 1);
    }

    setCurrentPartitionInfo(partitionInfo);

  };

  useEffect(() => {
    // 处理模型相关数据
    const inputParams = InferenceJobInput;
    if (inputParams?.model !== undefined
      && inputParams.isModelPrivate !== undefined) {
      const { isModelPrivate, model: modelId } = inputParams;
      // 如果用户修改表单值，则不再初始化数据
      if (!form.isFieldsTouched(["showModel",
        ["model", "type"], ["model", "name"],
        ["model", "version"]])) {
        setEntityInitData<ModelVersionInterface, ModelInterface>(
          "model",
          models,
          modelVersions,
          modelId,
          isModelPrivate,
          form,
          "showModel",
        );
      }
    }
  }, [InferenceJobInput, models, modelVersions, form]);


  // 处理镜像
  useEffect(() => {
    const inputParams = InferenceJobInput;
    if (inputParams && (inputParams.remoteImageUrl || inputParams.image)) {
      if (!form.isFieldsTouched([
        "imageSource",
        "remoteImageUrl",
        ["image", "type"],
        ["image", "name"],
      ])) {
        form.setFieldValue("imageSource", inputParams.remoteImageUrl ? ImageSource.REMOTE : ImageSource.LOCAL);
        if (images?.items?.length) {
          form.setFieldValue(["image", "name"], inputParams.image);
        } else {
          if (inputParams.remoteImageUrl) {
            form.setFieldValue("remoteImageUrl", inputParams.remoteImageUrl);
          } else {
            form.setFieldValue(["image", "type"], AccessibilityType.PRIVATE);
          }
        }
      }
    }
  }, [InferenceJobInput, images, form]);


  useEffect(() => {
    setCurrentPartitionInfo(clusterInfo?.partitions[0]);
    const inputParams = InferenceJobInput;
    if (!inputParams) {
      form.setFieldsValue({
        partition: clusterInfo?.partitions[0]?.name,
        appJobName: genAppJobName(clusterId, "i"),
      });
    } else {
      const { account, partition, gpuCount, coreCount, maxTime, mountPoints, nodeCount,
        containerServicePort } = inputParams;
      const command = "command" in inputParams ? inputParams.command : undefined;
      form.setFieldsValue({
        mountPoints,
        nodeCount,
        account,
        partition,
        gpuCount,
        coreCount,
        maxTime,
        appJobName: genAppJobName(clusterId,"i"),
        command,
        containerServicePort,
      });
    }

  }, [InferenceJobInput, clusterInfo]);

  const inferenceJobMutation = trpc.jobs.submitInferJob.useMutation({
    onSuccess() {
      message.success(t(pInfer("submitSuccessfully")));
      router.push(`/jobs/${clusterId}/runningJobs`);
    },
    onError(e) {
      message.error(`${t(pInfer("submitFailed"))}: ${e.message}`);
    },
  });

  return (
    <Form
      form={form}
      initialValues={{
        ... initialValues,
        imageSource:ImageSource.LOCAL,
      }}
      labelAlign="left"
      onFinish={async () => {

        const { appJobName, image, remoteImageUrl, model,mountPoints, account, partition, coreCount,
          gpuCount, maxTime, command, containerServicePort } = await form.validateFields();

        await inferenceJobMutation.mutateAsync({
          clusterId,
          InferenceJobName: appJobName,
          image: image?.name,
          remoteImageUrl,
          isModelPrivate,
          model: model?.version,
          mountPoints,
          account: account,
          partition: partition,
          nodeCount: nodeCount,
          coreCount: gpuCount ?
            gpuCount * Math.floor(currentPartitionInfo!.cores / currentPartitionInfo!.gpus) :
            coreCount,
          gpuCount: gpuCount,
          maxTime: isUnlimitedTime ? 0 : maxTime * 60,
          memory: memorySize,
          command: command || "",
          gpuType: currentPartitionInfo!.gpuType,
          containerServicePort,
        });
      }
      }

    >
      <Spin spinning={inferenceJobMutation.isLoading} tip="loading">
        <Form.Item name="appJobName" label={t(p("appJobName"))} rules={[{ required: true }, { max: 42 }]}>
          <Input />
        </Form.Item>
        <Divider orientation="left" orientationMargin="0">
          {t(pInfer("inferConfig"))}
        </Divider>
        <Form.Item
          label={"选择镜像类型"}
          name="imageSource"
        >
          <Radio.Group
            onChange={() => {
              form.setFieldsValue({
                image: { type: undefined, name: undefined },
                remoteImageUrl: undefined,
              });
            }}
            style={{ userSelect:"none" }}
          >
            <Radio value={ImageSource.LOCAL}> 本地镜像</Radio>
            <Radio value={ImageSource.REMOTE}> 远程镜像</Radio>
          </Radio.Group>
        </Form.Item>
        {
          (imageSource === ImageSource.LOCAL) && (
            <>
              <Form.Item label={t(p("image"))} required>
                <Space>
                  <Form.Item name={["image", "type"]} noStyle rules={[{ required: true, message: "" }]}>
                    <Select
                      allowClear
                      style={{ minWidth: 100 }}
                      onChange={() => {
                        form.setFieldsValue({ image: { name: undefined } });
                      }}
                      options={
                        [
                          {
                            value: AccessibilityType.PRIVATE,
                            label: t(p("privateImage")),
                          },
                          {
                            value:  AccessibilityType.PUBLIC,
                            label: t(p("publicImage")),
                          },
                        ]
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    name={["image", "name"]}
                    noStyle
                    rules={[
                      { required: true, message: "" },
                      {
                        validator: () => {
                          const name = form.getFieldValue(["image", "name"]);
                          const type = form.getFieldValue(["image", "type"]);

                          // 如果 type 、 version 或 name 其中有一个没有值，返回错误信息
                          if (!type || !name) {
                            return Promise.reject(new Error(t(p("selectImage"))));
                          }

                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Select
                      style={{ minWidth: 200 }}
                      allowClear
                      loading={isImagesLoading && isImagePublic !== undefined}
                      showSearch
                      optionFilterProp="label"
                      options={imageOptions}
                    />
                  </Form.Item>
                </Space>
              </Form.Item>
            </>
          )
        }
        {
          imageSource !== ImageSource.REMOTE && (
            <Form.Item label={t(p("imageDesc"))}>
              {imageId ? imageDescription[imageId] : null }
            </Form.Item>
          )
        }
        {
          imageSource === ImageSource.REMOTE && (
            <Form.Item
              label={t(p("remoteImageUrl"))}
              name="remoteImageUrl"
              required
              rules={[{ required:true }]}
            >
              <Input placeholder={t(p("RemoteImageUrlPlaceholder"))} />
            </Form.Item>
          )
        }

        <Form.Item
          label={t(pInfer("containerServicePort"))}
          name="containerServicePort"
          rules={[
            {
              required: true,
              type: "integer",
            },
          ]}
        >
          <InputNumber
            min={1}
            max={undefined}
            {...inputNumberFloorConfig}
          />
        </Form.Item>
        <Form.List name="mountPoints">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => {
                const { key, ...restField } = field;

                return (
                  <Space key={field.key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      label={`${t(p("mounts"))}-${index + 1}`}
                      rules={[
                        { required: true, message: t(p("mountsPlaceholder")) },
                        // 添加的自定义校验器以确保挂载点不重复
                        ({ getFieldValue }) => ({
                          validator(_, value: string) {

                            const currentValueNormalized = value.replace(/\/+$/, "");

                            const mountPoints: string[] = getFieldValue("mountPoints").map((mountPoint: string) =>
                              mountPoint.replace(/\/+$/, ""),
                            );

                            const currentIndex = mountPoints.findIndex((point) => point === currentValueNormalized);

                            const otherMountPoints = mountPoints.filter((_, idx) => idx !== currentIndex);
                            if (otherMountPoints.includes(currentValueNormalized)) {
                              return Promise.reject(new Error(t(p("mountsDuplicate"))));
                            }

                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Input
                        placeholder={t(p("selectMounts"))}
                        prefix={(
                          <FileSelectModal
                            allowedFileType={["DIR"]}
                            onSubmit={(path: string) => {
                            // 当用户选择路径后触发表单的值更新并进行校验
                              form.setFieldValue(["mountPoints", field.name], path);
                              // 校验特定的挂载点字段
                              form.validateFields([["mountPoints", field.name]]);
                            }}
                            clusterId={clusterId ?? ""}
                          />
                        )}
                      />
                    </Form.Item>
                    <MinusCircleOutlined
                      onClick={() => remove(field.name)}
                    />
                  </Space>
                );
              })}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                >
                  {t(p("addMounts"))}
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Divider orientation="left" orientationMargin="0">{t(pInfer("addModel"))}</Divider>
        <Form.Item label={t(p("addType"))} style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Form.Item
              name="showModel"
              valuePropName="checked"
              style={{ display: "inline-block", marginRight: 8 }}
            >
              <Checkbox onChange={() =>
                form.setFieldsValue({ model: { type: undefined, name: undefined, version: undefined } })}
              >
                {t(p("model"))}
              </Checkbox>
            </Form.Item>
          </div>
        </Form.Item>
        {
          showModel ? (
            <Form.Item
              label={t(p("model"))}
              labelCol={{ span: 1, style: { minWidth: "70px" } }}
              wrapperCol={{ span: 23 }}
            >
              <Space>
                <Form.Item
                  name={["model", "type"]}
                  noStyle
                  rules={[{ required: true, message: "" }]}
                >
                  <Select
                    allowClear
                    style={{ minWidth: 120 }}
                    onChange={() => {
                      form.setFieldsValue({ model: { name: undefined, version: undefined } });
                    }}
                    options={
                      [
                        {
                          value: AccessibilityType.PRIVATE,
                          label: t(p("privateModel")),
                        },
                        {
                          value:  AccessibilityType.PUBLIC,
                          label: t(p("publicModel")),
                        },
                      ]
                    }
                  />
                </Form.Item>
                <Form.Item
                  name={["model", "name"]}
                  noStyle
                  rules={[{ required: true, message: "" }]}
                >
                  <Select
                    allowClear
                    style={{ minWidth: 200 }}
                    onChange={() => {
                      form.setFieldValue(["model", "version"], undefined);
                    }}
                    loading={isModelsLoading }
                    options={modelOptions}
                  />
                </Form.Item>
                <Form.Item
                  name={["model", "version"]}
                  noStyle
                  rules={[
                    { required: true, message: "" },
                    {
                      validator: () => {
                        const name = form.getFieldValue(["model", "name"]);
                        const type = form.getFieldValue(["model", "type"]);
                        const version = form.getFieldValue(["model", "version"]);

                        // 如果 type 、 version 或 name 其中有一个没有值，返回错误信息
                        if (!type || !version || !name) {
                          return Promise.reject(new Error(t(p("selectModel"))));
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Select
                    allowClear
                    style={{ minWidth: 100 }}
                    loading={isModelVersionsLoading}
                    options={modelVersionOptions}
                  />
                </Form.Item>
              </Space>
            </Form.Item>
          ) : null
        }
        {
          modelVersionId && (
            <Form.Item label={t(p("modelDesc"))}>
              {modelVersionDescription[modelVersionId]}
            </Form.Item>
          )
        }
        <Divider orientation="left" orientationMargin="0">{t(p("resource"))}</Divider>
        <Form.Item
          label={t(p("account"))}
          name="account"
          rules={[{ required: true }]}
        >
          <AccountSelector cluster={clusterId} />
        </Form.Item>

        <Form.Item
          label={t(p("partition"))}
          name="partition"
          rules={[{ required: true }]}
        >
          <Select
            disabled={!currentPartitionInfo}
            options={clusterInfo
              ? clusterInfo.partitions.map((x) => ({ label: x.name, value: x.name }))
              : []
            }
            onChange={handlePartitionChange}
          />
        </Form.Item>
        <Form.Item
          label={t(p("nodeCount"))}
          name="nodeCount"
          dependencies={["partition"]}
          rules={[
            {
              required: true,
              type: "integer",
            },
          ]}
        >
          <InputNumber
            min={1}
            max={undefined}
            {...inputNumberFloorConfig}
          />
        </Form.Item>
        {
          currentPartitionInfo?.gpus ? (
            <Form.Item
              label={t(p("gpuCount"))}
              name="gpuCount"
              dependencies={["partition"]}
              rules={[
                {
                  required: true,
                  type: "integer",
                  // 单机最多8张卡
                  max: 8,
                  validator:  (_, value) => {
                    const nodeCount = form.getFieldValue("nodeCount") || 0;
                    if (currentPartitionInfo
    && currentPartitionInfo.gpus > 0
    && (nodeCount * value > currentPartitionInfo.gpus)) {
                      return Promise.reject(new Error("Total GPUs exceed the available GPUs in the partition"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                min={1}
                max={8}
                {...inputNumberFloorConfig}
              />
            </Form.Item>
          ) : (
            <Form.Item
              label={t(p("coreCount"))}
              name="coreCount"
              dependencies={["partition"]}
              rules={[
                { required: true,
                  type: "integer",
                  validator: (_, value) => {
                    const nodeCount = form.getFieldValue("nodeCount") || 0;
                    if (currentPartitionInfo && (nodeCount * value > currentPartitionInfo.cores)) {
                      return Promise.reject(new Error("Total cores exceed the available cores in the partition"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                min={1}
                {...inputNumberFloorConfig}
              />
            </Form.Item>
          )
        }
        <Form.Item label={t(p("maxTime"))} rules={[{ required: true }]} style={{ marginBottom:0 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Form.Item
              name="isUnlimitedTime"
              valuePropName="checked"
              style={{ display: "inline-block", marginRight: 8 }}
            >
              <Checkbox onChange={() =>
                form.setFieldsValue({ maxTime: 24 })
              }
              >
                {t(pInfer("unlimitedTime"))}
              </Checkbox>
            </Form.Item>
            {
              !isUnlimitedTime ? (
                <Form.Item name="maxTime" rules={[{ required: true }]}>
                  <InputNumber min={0.01} step={0.01} addonAfter="小时" />
                </Form.Item>
              ) : null
            }
          </div>
        </Form.Item>
        <Row>
          {
            currentPartitionInfo?.gpus
              ?
              (
                <Col span={12} sm={6}>
                  <Form.Item label={t(p("totalGpus"))}>
                    {nodeCount * gpuCount}
                  </Form.Item>
                </Col>
              ) : null
          }
          <Col span={12} sm={6}>
            <Form.Item label={t(p("totalCpus"))}>
              {coreCountSum}
            </Form.Item>
          </Col>
          <Col span={12} sm={6}>
            <Form.Item label={t(p("totalMem"))}>
              {memoryDisplay}
            </Form.Item>
          </Col>
        </Row>
        {
          <>
            <Divider orientation="left" orientationMargin="0" plain>{t(p("runningSetting"))}</Divider>
            <Form.Item label={t(p("command"))} name="command" rules={[{ required: true }]}>
              <Input.TextArea minLength={3} />
            </Form.Item>
          </>
        }
      </Spin>
      <Form.Item>
        <Button
          onClick={() => router.push(`/jobs/${clusterId}/createApps`)}
          style={{ marginRight: "10px" }}
        >
          {t("button.cancelButton")}
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={inferenceJobMutation.isLoading}
        >
          {t("button.submitButton")}
        </Button>
      </Form.Item>
    </Form>
  );
};
