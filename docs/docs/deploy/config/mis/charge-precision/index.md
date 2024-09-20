---
sidebar_position: 6
title: 作业消费记录精度配置
---

# 作业消费记录精度配置

允许在`config/mis.yaml`文件中配置作业消费记录精度，数值为0、1、2、3、4，代表精确到的小数位，默认精度为2位小数

```yaml title="config/mis.yaml"
# 默认精度为2，精确到0.01
jobChargeDecimalPrecision: 2
```


## 作业最小消费金额配置

允许在`config/mis.yaml`文件中配置作业最小消费金额，数值由用户自定义，默认为0.01。

配置：

```yaml title="config/mis.yaml"
# 单个作业最小消费金额，默认为0.01
jobMinCharge : 0.01
```

- 当计费项价格为0时，最小消费金额不生效，计费金额为0；
- 当作业运行时长为0时，最小消费金额不生效，计费金额为0；
- 建议最小消费金额数值与消费记录精度一致。例如消费记录精度为2时，最小消费金额为0.01，如果此时您将最小消费金额设置低于0.01，将会在启动OpenSCOW时报错。

## 恢复1.6.2及以前版本的作业计费逻辑

作业消费记录精度配置及作业最小消费金额配置在1.6.3版本中生效；如果您想恢复1.6.2及以前版本的作业计费逻：作业消费记录精度为3，作业最小消费金额为0，您只需要在mis.yaml文件中配置如下即可：

```yaml title="config/mis.yaml"
jobChargeDecimalPrecision: 3
jobMinCharge : 0
```