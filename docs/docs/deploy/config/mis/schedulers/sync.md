---
sidebar_position: 2
title: 同步封锁状态
description: 同步调度器账户、用户封锁状态
---

# 刷新调度器账户、用户封锁状态

由于已封锁的账户将会在slurm集群重启后被解封，且slurm集群可能在OpenSCOW运行时重启，但并不会给OpenSCOW发送信息，所以OpenSCOW在启动时将会自动刷新一次slurm账户的封锁/解封，用户的封锁状态，同时默认在每天凌晨4点执行一次同步。

如果您对时效性有要求，可以在slurm（其它调度器也一样，此处以slurm为例）集群重启后，手动执行一下**平台调试**->**封锁状态同步**的**立刻同步调度器账户和用户封锁状态**的功能。

如果您不需要此功能，也可以自定义配置：

在`config/mis.yaml`文件中，根据备注修改所需要的配置

```yaml title="config/mis.yaml"
# 周期性同步OpenSCOW与调度器(如slurm)账户用户封锁状态的配置
periodicSyncUserAccountBlockStatus:
  # 是否开启
  enabled: true
  # 周期的cron表达式
  cron: "0 4 * * *"

```
