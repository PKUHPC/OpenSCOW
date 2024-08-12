---
"@scow/config": patch
---

增加配置消费记录精度、最小消费金额的功能，默认精度为 2 位小数，默认最小消费金额为 0.01。作业消费记录精度配置及作业最小消费金额配置在 scow v1.6.2 以后的版本中生效，如果您不想更改之前的版本中的计费逻辑，需要增加配置如下：

```yaml title="config/mis.yaml"
jobChargeDecimalPrecision: 3
jobMinCharge : 0
```