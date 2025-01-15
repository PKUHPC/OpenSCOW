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
import { I18nStringType } from "@scow/config/build/i18n";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { App, Button, Checkbox, Col,
  Divider, Form, Input, InputNumber, Radio, Row, Select, Space, Spin, Typography } from "antd";
import { Rule } from "antd/es/form";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AccountSelector } from "src/components/AccountSelector";
import { FileSelectModal } from "src/components/FileSelectModal";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { AlgorithmInterface, AlgorithmVersionInterface } from "src/models/Algorithm";
import { Status } from "src/models/Image";
import { ImageSource } from "src/models/Job";
import { ModelInterface, ModelVersionInterface } from "src/models/Model";
import { DatasetInterface } from "src/server/trpc/route/dataset/dataset";
import { DatasetVersionInterface } from "src/server/trpc/route/dataset/datasetVersion";
import { AppCustomAttribute, CreateAppInput } from "src/server/trpc/route/jobs/apps";
import { FrameworkType, TrainJobInput } from "src/server/trpc/route/jobs/jobs";
import { formatSize, truncateString } from "src/utils/format";
import { parseBooleanParam } from "src/utils/parse";
import { trpc } from "src/utils/trpc";

import { setEntityInitData, useDataOptions, useDataVersionOptions } from "./hooks";

interface Props {
  appId?: string;
  appName?: string;
  appImage?: {
    name: string;
    tag: string;
  };
  attributes?: AppCustomAttribute[];
  appComment?: I18nStringType;
  clusterId: string;
  clusterInfo: ClusterConfig;
  isTraining?: boolean;
  createAppParams?: CreateAppInput
  trainJobInput?: TrainJobInput
}

interface FixedFormFields {
  appJobName: string;
  showAlgorithm: boolean;
  algorithm: { type: AccessibilityType, name: number, version: number };
  imageSource: ImageSource;
  image: { type: AccessibilityType, name: number };
  remoteImageUrl: string | undefined;
  framework: FrameworkType | undefined;
  startCommand?: string;
  showDataset: boolean;
  dataset: { type: AccessibilityType, name: number, version: number };
  showModel: boolean;
  model: { type: AccessibilityType, name: number, version: number };
  mountPoints: string[] | undefined;
  partition: string | undefined;
  coreCount: number;
  nodeCount: number;
  gpuCount: number | undefined;
  account: string;
  maxTime: number;
  command?: string;
  // TensorFlow特有参数
  psNodes?: number;
  workerNodes?: number;
}

interface CustomFormFields {
  customFields: Record<string, number | string | undefined>;
}
type FormFields = CustomFormFields & FixedFormFields;

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
} as Partial<FormFields>;

const inputNumberFloorConfig = {
  formatter: (value: number | undefined) => `${Math.floor(value ?? 0)}`,
  parser: (value: string | undefined) => Math.floor(value ? +value : 0),
};


export const LaunchAppForm = (props: Props) => {

  const languageId = useI18n().currentLanguage.id;
  const t = useI18nTranslateToString();
  const p = prefix("app.jobs.launchAppForm.");

  const { clusterId, appName, clusterInfo, isTraining = false,
    appId, attributes = [], appImage, createAppParams, trainJobInput,appComment } = props;

  const { message } = App.useApp();

  const router = useRouter();

  const [form] = Form.useForm<FormFields>();

  const [currentPartitionInfo, setCurrentPartitionInfo] = useState<Partition | undefined>();

  const [frameworkOptions, setFrameworkOptions] = useState<{ value: FrameworkType, label: string }[]>([
    {
      value: "tensorflow",
      label: "TensorFlow",
    },
    {
      value: "pytorch",
      label: "PyTorch",
    },
  ]);

  const showAlgorithm = Form.useWatch("showAlgorithm", form);
  const showDataset = Form.useWatch("showDataset", form);
  const showModel = Form.useWatch("showModel", form);
  const imageSource = Form.useWatch("imageSource", form);

  const isAlgorithmPrivate = Form.useWatch(["algorithm", "type"], form) === AccessibilityType.PRIVATE;
  const isDatasetPrivate = Form.useWatch(["dataset", "type"], form) === AccessibilityType.PRIVATE;
  const isModelPrivate = Form.useWatch(["model", "type"], form) === AccessibilityType.PRIVATE;

  const {
    data: datasets, dataOptions: datasetOptions, isDataLoading:  isDatasetsLoading,
  } = useDataOptions<DatasetInterface>(
    form,
    "dataset",
    trpc.dataset.list.useQuery,
    clusterId,
    (dataset) => ({ label: `${dataset.name}(${dataset.owner})`, value: dataset.id }),
  );

  const {
    dataVersions: datasetVersions,
    dataVersionOptions: datasetVersionOptions,
    isDataVersionsLoading: isDatasetVersionsLoading,
    dataVersionDescription:datasetVersionDescription,
  } =
  useDataVersionOptions<DatasetVersionInterface>(
    form,
    "dataset",
    trpc.dataset.versionList.useQuery,
    (x) => ({ label: x.versionName, value: x.id }),
  );

  const {
    data: algorithms, dataOptions: algorithmOptions, isDataLoading:  isAlgorithmLoading,
  } = useDataOptions<AlgorithmInterface>(
    form,
    "algorithm",
    trpc.algorithm.getAlgorithms.useQuery,
    clusterId,
    (x) => ({ label:`${x.name}(${x.owner})`, value: x.id }),
  );

  const {
    dataVersions: algorithmVersions,
    dataVersionOptions: algorithmVersionOptions,
    isDataVersionsLoading: isAlgorithmVersionsLoading,
    dataVersionDescription:algorithmVersionDescription,
  } =
  useDataVersionOptions<AlgorithmVersionInterface>(
    form,
    "algorithm",
    trpc.algorithm.getAlgorithmVersions.useQuery,
    (x) => ({ label: x.versionName, value: x.id }),
  );

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
  const selectedImage = Form.useWatch(["image", "name"], form);

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

  const framework = Form.useWatch("framework", form);

  const imageId = Form.useWatch(["image", "name"], form);
  const algorithmVersionId = Form.useWatch(["algorithm", "version"], form);
  const datasetVersionId = Form.useWatch(["dataset", "version"], form);
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

    form.setFieldValue("framework", undefined);

    setCurrentPartitionInfo(partitionInfo);

  };

  useEffect(() => {
    // 特殊处理，如果是华为Ascend910，则增加MindSpore选项
    if (currentPartitionInfo?.gpuType === "huawei.com/Ascend910") {
      setFrameworkOptions((prevOptions) => {
        return prevOptions.find((item) => item.value === "mindspore") ?
          prevOptions : [...prevOptions, { value: "mindspore", label: "MindSpore" }];
      });
    } else {
      setFrameworkOptions((prevOptions) => {
        return prevOptions.filter((item) => item.value !== "mindspore");
      });
    }
  }, [currentPartitionInfo]);
  const customFormItems = useMemo(() => attributes.map((item, index) => {
    const rules: Rule[] = item.type === "NUMBER"
      ? [{ type: "integer" }, { required: item.required }]
      : [{ required: item.required }];

    const placeholder = item.placeholder ?? "";

    // 筛选选项：若没有配置requireGpu直接使用，配置了requireGpu项使用与否则看改分区有无GPU
    const selectOptions = item.select.filter((x) => !x.requireGpu || (x.requireGpu && currentPartitionInfo?.gpus));
    const initialValue = item.type === "SELECT" ? (item.defaultValue ?? selectOptions[0].value) : item.defaultValue;

    let inputItem: JSX.Element;

    // 特殊处理某些应用的工作目录需要使用文件选择器
    if (item.name === "workingDir") {
      inputItem = (
        <Input
          placeholder={getI18nConfigCurrentText(placeholder, languageId)}
          prefix={
            (
              <FileSelectModal
                allowedFileType={["DIR"]}
                onSubmit={(path: string) => {
                  form.setFieldsValue({
                    customFields: {
                      [item.name]: path,
                    },
                  });
                  form.validateFields([["customFields", item.name]]);
                }}
                clusterId={clusterId ?? ""}
              />
            )
          }
        />
      );
    } else {
      inputItem = item.type === "NUMBER" ?
        (<InputNumber placeholder={getI18nConfigCurrentText(placeholder, languageId)} />)
        : item.type === "TEXT" ? (<Input placeholder={getI18nConfigCurrentText(placeholder, languageId)} />)
          : (
            <Select
              options={selectOptions.map((x) => ({
                label: getI18nConfigCurrentText(x.label, languageId), value: x.value }))}
              placeholder={getI18nConfigCurrentText(placeholder, languageId)}
            />
          );
    }

    // 判断是否配置了requireGpu选项
    if (item.type === "SELECT" && item.select.find((i) => i.requireGpu !== undefined)) {
      const preValue = form.getFieldValue(item.name);

      if (preValue) {
        // 切换分区后看之前的版本是否还存在，若不存在，则选择版本的select的值置空
        const optionsContained = selectOptions.find((i) => i.value === preValue);
        if (!optionsContained) form.setFieldValue(item.name, null);
      }
    }

    return (
      <Form.Item
        key={`${item.name}+${index}`}
        label={getI18nConfigCurrentText(item.label, languageId) ?? undefined}
        name={["customFields", item.name]}
        rules={rules}
        initialValue={initialValue}
        {...(item.name === "workingDir" ? {
          tooltip: (
            <>
              <span>{t(p("autoAdd"))}</span>
            </>
          ),
        } : {})}
      >
        {inputItem}
      </Form.Item>
    );
  }), [attributes, currentPartitionInfo,languageId]);


  useEffect(() => {
    // 处理算法相关数据
    const inputParams = trainJobInput || createAppParams;
    if (inputParams?.algorithm !== undefined
      && inputParams.isAlgorithmPrivate !== undefined) {
      const { isAlgorithmPrivate, algorithm: algorithmId } = inputParams;
      // 如果用户修改表单值，则不再初始化数据
      if (!form.isFieldsTouched(["showAlgorithm",
        ["algorithm", "type"], ["algorithm", "name"],
        ["algorithm", "version"]])) {
        setEntityInitData<AlgorithmVersionInterface, AlgorithmInterface>(
          "algorithm",
          algorithms,
          algorithmVersions,
          algorithmId,
          isAlgorithmPrivate,
          form,
          "showAlgorithm",
        );
      }
    }
  }, [createAppParams, trainJobInput, algorithms, algorithmVersions, form]);

  useEffect(() => {
    // 处理数据集相关数据
    const inputParams = trainJobInput || createAppParams;
    if (inputParams?.dataset !== undefined
      && inputParams.isDatasetPrivate !== undefined) {
      const { isDatasetPrivate, dataset: datasetId } = inputParams;
      // 如果用户修改表单值，则不再初始化数据
      if (!form.isFieldsTouched(["showDataset",
        ["dataset", "type"], ["dataset", "name"],
        ["dataset", "version"]])) {
        setEntityInitData<DatasetVersionInterface, DatasetInterface>(
          "dataset",
          datasets,
          datasetVersions,
          datasetId,
          isDatasetPrivate,
          form,
          "showDataset",
        );
      }
    }
  }, [ createAppParams, trainJobInput, datasets, datasetVersions, form]);

  useEffect(() => {
    // 处理模型相关数据
    const inputParams = trainJobInput || createAppParams;
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
  }, [createAppParams, trainJobInput, models, modelVersions, form]);


  // 处理镜像
  useEffect(() => {
    const inputParams = trainJobInput || createAppParams;
    if (inputParams && (inputParams.remoteImageUrl || inputParams.image)) {
      if (!form.isFieldsTouched([
        "imageSource",
        "startCommand",
        "remoteImageUrl",
        ["image", "type"],
        ["image", "name"],
      ])) {
        form.setFieldValue("imageSource", inputParams.remoteImageUrl ? ImageSource.REMOTE : ImageSource.LOCAL);
        if ("startCommand" in inputParams) {
          form.setFieldValue("startCommand", inputParams.startCommand);
        }
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
  }, [createAppParams, trainJobInput, images, form]);


  useEffect(() => {
    setCurrentPartitionInfo(clusterInfo?.partitions[0]);
    const inputParams = trainJobInput || createAppParams;
    if (!inputParams) {
      form.setFieldsValue({
        partition: clusterInfo?.partitions[0]?.name,
        appJobName: genAppJobName(clusterId, appName ?? "t"),
      });
    } else {
      const { account, partition, gpuCount, coreCount, maxTime, mountPoints, nodeCount } = inputParams;
      const workingDir = "workingDirectory" in inputParams ? inputParams.workingDirectory : undefined;
      const customAttributes = "customAttributes" in inputParams ? inputParams.customAttributes : {};
      const command = "command" in inputParams ? inputParams.command : undefined;
      const framework = "framework" in inputParams ? inputParams.framework : undefined;
      const psNodes = "psNodes" in inputParams ? inputParams.psNodes : undefined;
      const workerNodes = "workerNodes" in inputParams ? inputParams.workerNodes : undefined;
      form.setFieldsValue({
        mountPoints,
        customFields: {
          ...customAttributes,
          workingDir,
        },
        nodeCount,
        framework,
        account,
        partition,
        gpuCount,
        coreCount,
        maxTime,
        appJobName: genAppJobName(clusterId, appName ?? "t"),
        command,
        psNodes,
        workerNodes,
      });
    }

  }, [createAppParams, trainJobInput, clusterInfo]);

  const createAppSessionMutation = trpc.jobs.createAppSession.useMutation({
    onSuccess() {
      message.success(t(p("createSuccessfully")));
      router.push(`/jobs/${clusterId}/runningJobs`);
    },
    onError(e) {
      message.error(`${t(p("createFailed"))}: ${e.message}`);
    },
  });

  const trainJobMutation = trpc.jobs.trainJob.useMutation({
    onSuccess() {
      message.success(t(p("submitTrainSuccessfully")));
      router.push(`/jobs/${clusterId}/runningJobs`);
    },
    onError(e) {
      message.error(`${t(p("submitTrainFailed"))}: ${e.message}`);
    },
  });

  const handleFormChange = (changedValues: Partial<FormFields>, allValues: FormFields) => {
    const { psNodes, workerNodes } = allValues;
    if ("psNodes" in changedValues || "workerNodes" in changedValues) {
      const newTotal = (psNodes || 0) + (workerNodes || 0);
      form.setFieldsValue({ nodeCount: newTotal });
    }
  };

  return (
    <Form
      form={form}
      initialValues={{
        ... initialValues,
        imageSource: isTraining ? ImageSource.LOCAL : ImageSource.DEFAULT,
      }}
      labelAlign="left"
      onValuesChange={handleFormChange}
      onFinish={async () => {

        const { appJobName, algorithm, dataset, image, remoteImageUrl, framework, startCommand, model,
          mountPoints, account, partition, coreCount,
          gpuCount, maxTime, command, customFields, psNodes, workerNodes } = await form.validateFields();

        if (isTraining) {
          await trainJobMutation.mutateAsync({
            clusterId,
            trainJobName: truncateString(appJobName),
            isAlgorithmPrivate,
            algorithm: algorithm?.version,
            image: image?.name,
            remoteImageUrl,
            framework,
            isDatasetPrivate,
            dataset: dataset?.version,
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
            maxTime: maxTime,
            memory: memorySize,
            command: command || "",
            gpuType: currentPartitionInfo!.gpuType,
            psNodes,
            workerNodes,
          });
        } else {
          let workingDirectory: string | undefined;
          const customFormKeyValue: CustomFormFields = { customFields: {} };
          attributes.forEach((customFormAttribute) => {
            const customFormKey = customFormAttribute.name;
            if (customFormKey === "workingDir") {
              workingDirectory = customFields[customFormKey]?.toString();
            }
            customFormKeyValue.customFields[customFormKey] = customFields[customFormKey];
          });

          createAppSessionMutation.mutate({
            clusterId,
            appId: appId!,
            appJobName:truncateString(appJobName),
            isAlgorithmPrivate,
            algorithm: algorithm?.version,
            image: image?.name,
            remoteImageUrl,
            startCommand,
            isDatasetPrivate,
            dataset: dataset?.version,
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
            maxTime: maxTime,
            memory: memorySize,
            workingDirectory,
            customAttributes: customFormKeyValue.customFields,
            gpuType: currentPartitionInfo!.gpuType,
          });
        }
      }
      }

    >
      <Spin spinning={createAppSessionMutation.isLoading || trainJobMutation.isLoading} tip="loading">
        <Form.Item name="appJobName" label={t(p("appJobName"))} rules={[{ required: true }, { max: 52 }]}>
          <Input />
        </Form.Item>
        <Divider orientation="left" orientationMargin="0">
          {isTraining ? t(p("trainConfig")) : t(p("appConfig"))}
        </Divider>
        <Form.Item
          label={"选择镜像类型"}
          name="imageSource"
          help={ !isTraining && imageSource !== ImageSource.DEFAULT &&
            <Typography.Text type="danger">{`${t(p("imageText"),[appName])}`}</Typography.Text>
          }
        >
          <Radio.Group
            onChange={() => {
              form.setFieldsValue({
                image: { type: undefined, name: undefined },
                remoteImageUrl: undefined,
                startCommand: undefined,
              });
            }}
            style={{ userSelect:"none" }}
          >
            {!isTraining && <Radio value={ImageSource.DEFAULT}> 默认镜像 </Radio>}
            <Radio value={ImageSource.LOCAL}> 本地镜像</Radio>
            <Radio value={ImageSource.REMOTE}> 远程镜像</Radio>
          </Radio.Group>
        </Form.Item>
        {imageSource !== ImageSource.REMOTE && (
          <Form.Item
            label={"当前选择镜像"}
          >
            <Space>
              <strong>
                {selectedImage
                  ? imageOptions?.find((x) => x.value === selectedImage)?.label
                  : appImage && imageSource === ImageSource.DEFAULT ? `${appImage?.name}:${appImage?.tag}` : "-"}
              </strong>
            </Space>
          </Form.Item>
        )}
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
                      onChange={() => {
                        form.setFieldValue("startCommand", undefined);
                      }}
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
              {imageId ? imageDescription[imageId] :
                imageSource === ImageSource.DEFAULT ? getI18nConfigCurrentText(appComment,languageId) :
                  null }
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
        {(imageSource !== ImageSource.DEFAULT && !isTraining) ? (
          <Form.Item
            label={t(p("startCommand"))}
            name="startCommand"
            required
            rules={[{ required:true }]}
          >
            <Input placeholder={t(p("startCommandPlaceholder"))} />
          </Form.Item>
        ) : null }

        {
          customFormItems.filter((item) => item?.key?.includes("workingDir"))
        }

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

                            const workingDirectory = form.getFieldValue("customFields")?.workingDir?.toString();
                            if (workingDirectory && workingDirectory.replace(/\/+$/, "") === currentValueNormalized) {
                              return Promise.reject(new Error(t(p("mountsText"))));
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
        <Divider orientation="left" orientationMargin="0">{t(p("addOther"))}</Divider>
        <Form.Item label={t(p("addType"))} style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Form.Item
              name="showAlgorithm"
              valuePropName="checked"
              style={{ display: "inline-block", marginRight: 8 }}
            >
              <Checkbox onChange={() =>
                form.setFieldsValue({ algorithm: { type: undefined, name: undefined, version: undefined } })}
              >
                {t(p("algorithm"))}
              </Checkbox>
            </Form.Item>
            <Form.Item
              name="showDataset"
              valuePropName="checked"
              style={{ display: "inline-block", marginRight: 8 }}
            >
              <Checkbox onChange={() =>
                form.setFieldsValue({ dataset: { type: undefined, name: undefined, version: undefined } })}
              >
                {t(p("dataset"))}
              </Checkbox>
            </Form.Item>
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
          showAlgorithm ? (
            <Form.Item
              label={t(p("algorithm"))}
              labelCol={{ span: 1, style: { minWidth: "70px" } }}
              wrapperCol={{ span: 23 }}
            >
              <Space>
                <Form.Item
                  name={["algorithm", "type"]}
                  noStyle
                  rules={[{ required: true, message: "" }]}
                >
                  <Select
                    allowClear
                    style={{ minWidth: 120 }}
                    onChange={() => {
                      form.setFieldsValue({ algorithm: { name: undefined, version: undefined } });
                    }}
                    options={
                      [
                        {
                          value: AccessibilityType.PRIVATE,
                          label: t(p("privateAlgorithm")),
                        },
                        {
                          value:  AccessibilityType.PUBLIC,
                          label: t(p("publicAlgorithm")),
                        },
                      ]
                    }
                  />
                </Form.Item>
                <Form.Item name={["algorithm", "name"]} noStyle rules={[{ required: true, message: "" }]}>
                  <Select
                    allowClear
                    style={{ minWidth: 200 }}
                    onChange={() => {
                      form.setFieldValue(["algorithm", "version"], undefined);
                    }}
                    loading={isAlgorithmLoading}
                    showSearch
                    optionFilterProp="label"
                    options={algorithmOptions}
                  />
                </Form.Item>
                <Form.Item
                  name={["algorithm", "version"]}
                  noStyle
                  rules={[
                    { required: true, message: "" },
                    {
                      validator: () => {
                        const name = form.getFieldValue(["algorithm", "name"]);
                        const type = form.getFieldValue(["algorithm", "type"]);
                        const version = form.getFieldValue(["algorithm", "version"]);

                        // 如果 type 、 version 或 name 其中有一个没有值，返回错误信息
                        if (!type || !version || !name) {
                          return Promise.reject(new Error(t(p("selectAlgorithm"))));
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Select
                    allowClear
                    style={{ minWidth: 100 }}
                    loading={isAlgorithmVersionsLoading}
                    showSearch
                    optionFilterProp="label"
                    options={algorithmVersionOptions}
                  />
                </Form.Item>
              </Space>
            </Form.Item>
          ) : null
        }
        {
          algorithmVersionId && (
            <Form.Item
              label={t(p("algorithmDesc"))}
            >
              {algorithmVersionDescription[algorithmVersionId]}
            </Form.Item>
          )
        }
        {
          showDataset ? (
            <Form.Item
              label={t(p("dataset"))}
              labelCol={{ span: 1, style: { minWidth: "70px" } }}
              wrapperCol={{ span: 23 }}
            >
              <Space>
                <Form.Item name={["dataset", "type"]} noStyle rules={[{ required: true, message: "" }]}>
                  <Select
                    allowClear
                    style={{ minWidth: 120 }}
                    onChange={() => {
                      form.setFieldsValue({ dataset: { name: undefined, version: undefined } });
                    }}
                    options={
                      [
                        {
                          value: AccessibilityType.PRIVATE,
                          label: t(p("privateDataset")),
                        },
                        {
                          value: AccessibilityType.PUBLIC,
                          label: t(p("publicDataset")),
                        },

                      ]
                    }
                  />
                </Form.Item>
                <Form.Item
                  name={["dataset", "name"]}
                  noStyle
                  rules={[{ required: true, message: "" }]}
                >
                  <Select
                    allowClear
                    style={{ minWidth: 200 }}
                    loading={isDatasetsLoading}
                    onChange={() => {
                      form.setFieldValue(["dataset", "version"], undefined);
                    }}
                    showSearch
                    optionFilterProp="label"
                    options={datasetOptions}
                  />
                </Form.Item>
                <Form.Item
                  name={["dataset", "version"]}
                  noStyle
                  rules={[
                    { required: true, message: "" },
                    {
                      validator: () => {
                        const name = form.getFieldValue(["dataset", "name"]);
                        const type = form.getFieldValue(["dataset", "type"]);
                        const version = form.getFieldValue(["dataset", "version"]);

                        // 如果 type 、 version 或 name 其中有一个没有值，返回错误信息
                        if (!type || !version || !name) {
                          return Promise.reject(new Error(t(p("selectDataset"))));
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Select
                    allowClear
                    style={{ minWidth: 100 }}
                    loading={isDatasetVersionsLoading}
                    showSearch
                    optionFilterProp="label"
                    options={datasetVersionOptions}
                  />
                </Form.Item>
              </Space>
            </Form.Item>
          ) : null
        }
        {
          datasetVersionId && (
            <Form.Item
              label={t(p("datasetDesc"))}
            >
              {datasetVersionDescription[datasetVersionId]}
            </Form.Item>
          )
        }
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
                    showSearch
                    optionFilterProp="label"
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
                    showSearch
                    optionFilterProp="label"
                    options={modelVersionOptions}
                  />
                </Form.Item>
              </Space>
            </Form.Item>
          ) : null
        }
        {
          modelVersionId && (
            <Form.Item
              label={t(p("modelDesc"))}
            >
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
            max={isTraining ? undefined : 1}
            {...inputNumberFloorConfig}
            // framework是tensorflow且不是华为卡时 不允许手动改
            disabled={isTraining && framework === "tensorflow"
        && (currentPartitionInfo ? currentPartitionInfo.gpuType !== "huawei.com/Ascend910" : true)}
          />
        </Form.Item>
        {/* tensorflow训练框架时，除了huawei.com/Ascend910的卡之外，都要区分PS node 和worker node */}
        {(isTraining && framework === "tensorflow"
        && (currentPartitionInfo ? currentPartitionInfo.gpuType !== "huawei.com/Ascend910" : true)) ? (
            <>
              <Form.Item
                label={t(p("psNodes"))}
                name="psNodes"
                initialValue={1}
                rules={[
                  { required: true,
                    type: "integer",
                  },
                ]}
              >
                <InputNumber
                  defaultValue={1}
                  min={1}
                  {...inputNumberFloorConfig}
                />
              </Form.Item>
            </>
          ) : null}
        {(isTraining && framework === "tensorflow"
        && (currentPartitionInfo ? currentPartitionInfo.gpuType !== "huawei.com/Ascend910" : true)) ? (
            <>
              <Form.Item
                label={t(p("workerNodes"))}
                name="workerNodes"
                initialValue={nodeCount - 1}
                rules={[
                  { required: true,
                    type: "integer",
                  },
                ]}
              >
                <InputNumber
                  defaultValue={nodeCount - 1}
                  min={1}
                  {...inputNumberFloorConfig}
                />
              </Form.Item>
            </>
          ) : null}
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
        {/* 分布式训练或者华为的卡训练，需要指定训练框架 */}
        {(isTraining && (nodeCount > 1 || currentPartitionInfo?.gpuType === "huawei.com/Ascend910")) ? (
          <>
            {/* 手动选择算法框架，下拉框只有 tensorflow, pytorch */}
            <Form.Item
              label={t(p("framework"))}
              name="framework"
              rules={[{ required: true }]}
            >
              <Select options={frameworkOptions}>
              </Select>
            </Form.Item>
          </>
        ) : null}
        <Form.Item label={t(p("maxTime"))} name="maxTime" rules={[{ required: true }]}>
          <InputNumber min={1} step={1} addonAfter={t(p("min"))} />
        </Form.Item>
        {
          customFormItems.filter((item) => !item?.key?.includes("workingDir"))
        }
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
          isTraining ? (
            <>
              <Divider orientation="left" orientationMargin="0" plain>{t(p("runningSetting"))}</Divider>
              <Form.Item label={t(p("command"))} name="command" rules={[{ required: true }]}>
                <Input.TextArea minLength={3} />
              </Form.Item>
            </>
          ) : null
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
          loading={createAppSessionMutation.isLoading}
        >
          {t("button.submitButton")}
        </Button>
      </Form.Item>
    </Form>
  );
};
