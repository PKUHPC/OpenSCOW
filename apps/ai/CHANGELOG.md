# @scow/ai

## 0.2.1

### Patch Changes

- 55a619e: 修复 更新算法和模型时查找已存在实体逻辑错误的问题
- c178b72: xterm npm 包更名
- 01bd823: 修复 trpc openapi 将 boolean params 全部转为 string 的问题
- e312efb: AI 模块支持创建 vnc 类型应用
- a737493: jupyter 启动命令参数 PasswordIdentityProvider.hashed_password 改为 ServerApp.password
- e312efb: ai 增加 vnc 功能，以 shell 方式进入容器功能和提交作业的优化
- a4d36e2: 启用 serverMinification，只关闭 name mangling
- 37fdf7e: 修改了 portal 中的部分 UI 样式,bannerTop 导航文字
- e312efb: ai 新增以 shell 的方式进入容器的功能
- Updated dependencies [94aa24c]
- Updated dependencies [e312efb]
- Updated dependencies [e312efb]
- Updated dependencies [640a599]
  - @scow/config@1.4.4
  - @scow/lib-web@1.3.2
  - @scow/scheduler-adapter-protos@1.3.1
  - @scow/lib-operation-log@2.1.4
  - @scow/lib-server@1.2.1
  - @scow/lib-scheduler-adapter@1.1.8
  - @scow/rich-error-model@2.0.0

## 0.2.0

### Minor Changes

- 63d1873: 账户新增封锁阈值，租户新增默认账户默认阈值以

### Patch Changes

- 3c5c8a6: 修复大镜像在 Containerd 运行时推送失败的问题
- a097dd1: 新增无账户关系的用户修改所属租户且可以作为新增租户的管理员功能
- 4e14446: 修复集群 partitions 为空时，页面崩溃的问题以及拼写错误
- 01cfdae: 修改对于 ssh 命令执行错误的判断
- 02d6a18: 新增集群区分 AI 功能和 HPC 功能配置
- b8d7684: 修复 ai 中创建或复制文件数据检查源文件时，后台没有打印日志的问题
- 24db413: 操作日志增加自定义操作类型
- d822db7: ai 系统新增支持 k8s 集群的 containerd 运行时
- 6d4b22c: AI 系统创建应用和训练页面 UI 交互优化
- 0f5d48f: 修复 AI 训练 coreCount 在 gpu 下传参错误问题
- Updated dependencies [02d6a18]
- Updated dependencies [146e19f]
- Updated dependencies [63d1873]
- Updated dependencies [24db413]
- Updated dependencies [d822db7]
- Updated dependencies [850a7ee]
  - @scow/config@1.4.3
  - @scow/lib-web@1.3.1
  - @scow/lib-server@1.2.0
  - @scow/lib-operation-log@2.1.3
  - @scow/rich-error-model@2.0.0
  - @scow/lib-scheduler-adapter@1.1.7

## 0.1.1

### Patch Changes

- 3242957: 修复创建失败的镜像无法删除的问题
- 8cba2eb: 修复修改模型版本时校验名称重复错误问题
- Updated dependencies [443187e]
- Updated dependencies [3242957]
- Updated dependencies [850bbcd]
  - @scow/lib-server@1.1.5
  - @scow/config@1.4.2
  - @scow/lib-operation-log@2.1.2
  - @scow/lib-web@1.3.0
  - @scow/rich-error-model@2.0.0
  - @scow/lib-scheduler-adapter@1.1.6
