---
"@scow/config": patch
---

增加配置消费记录精度、最小消费金额的功能，默认精度为 2 位小数，默认最小消费金额为 0.01。
### 注意：此更新必定影响作业计费结果（除非您以前所有计费项价格皆为0）如果您不想更改之前的版本中的计费逻辑，需要增加配置如下：

```yaml title="config/mis.yaml"
jobChargeDecimalPrecision: 3
jobMinCharge : 0
```