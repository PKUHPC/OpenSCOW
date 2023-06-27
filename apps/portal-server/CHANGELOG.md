# @scow/portal-server

## 0.7.0

### Patch Changes

- 0f64e5404: 获取桌面和应用列表时，不再解析节点域名到 IP
- Updated dependencies [0f64e5404]
- Updated dependencies [81895f4be]
  - @scow/config@0.3.1
  - @scow/protos@0.2.3
  - @scow/lib-server@0.2.0
  - @scow/lib-slurm@0.1.5

## 0.6.0

### Patch Changes

- d2c8e765e: 优化创建交互式应用页面：在用户家目录下的 apps/app[Id]路径下存入上一次提交记录；创建了查找上一次提交记录的 API 接口，每次创建交互式应用时查找上一次提交记录，如果有则与当前集群下配置对比选择填入相应的值。
- 8b36bf0bc: 检查交互式应用是否可连接的逻辑移动到前端
- Updated dependencies [901ecdb7e]
- Updated dependencies [d2c8e765e]
- Updated dependencies [ce077930a]
  - @scow/config@0.3.0
  - @scow/lib-config@0.2.2
  - @scow/lib-server@0.2.0
  - @scow/protos@0.2.2
  - @scow/lib-slurm@0.1.4

## 0.5.0

### Minor Changes

- 2981664f4: 门户所有作业列增加开始、结束时间列，增加时间说明
- aa4d0ff1c: 为 PENDING 等需要显示作业未运行原因的状态的 APP，显示原因
- 7bd2578c4: SCOW API 增加静态 token 认证方法
- 88899d41f: 提交任务增加默认输出文件
- 1562ebbd2: 提交作业时增加 GPU 选项

### Patch Changes

- a7fd75778: 修复文件管理界面，操作无权限文件/文件夹时页面的错误提示
- 583e9f98b: 修复交互式应用创建后初始化阶段无法连接问题
- d6e06e841: 读取配置文件时允许传入 logger 对象
- cb90eb64b: 门户支持配置代理网关节点
- Updated dependencies [5c066e4a5]
- Updated dependencies [7bd2578c4]
- Updated dependencies [ef8b7eee0]
- Updated dependencies [9cb6822e6]
- Updated dependencies [74d718ba1]
- Updated dependencies [1562ebbd2]
- Updated dependencies [d6e06e841]
- Updated dependencies [cb90eb64b]
  - @scow/lib-ssh@0.3.0
  - @scow/config@0.2.0
  - @scow/lib-server@0.2.0
  - @scow/lib-config@0.2.1
  - @scow/protos@0.2.1
  - @scow/lib-slurm@0.1.3

## 0.4.0

### Minor Changes

- 86e0f5b2d: 整个系统打包为一个镜像
- 882a247a1: 重构 app 的 sbatch options，gRPC 中与 custom_attributes 一起发送
- d4b0cde25: 创建 web 类交互式应用时由前端传入 base path，将节点名解析为 IP 地址的工作由 portal-server 完成

### Patch Changes

- bdc990a0c: 系统启动时，各个容器在日志中打印版本信息
- 613c26e91: 修复当一个 slurm 用户对同一个账户在不同分区中有不同配置时，列出所有账户时账户列表重复的问题
- 419184a93: 统一处理多个 sftp 操作命令报错
- 5a0698707: portal-server 启动时在/etc/profile.d 配置 shell 打开文件所需功能
- 187244443: apps/portal-server/src/clusterops/api/app.ts 中 CreateAppRequest 中去除 sbatchOptions
- 1c8a948d8: 把代码中 SavedJobs 字样全部改为 JobTemplate
- Updated dependencies [bdc990a0c]
- Updated dependencies [86e0f5b2d]
- Updated dependencies [419184a93]
- Updated dependencies [8145061ba]
  - @scow/utils@0.1.2
  - @scow/protos@0.2.0
  - @scow/lib-ssh@0.2.0
  - @scow/lib-config@0.2.0
  - @scow/lib-slurm@0.1.2
  - @scow/config@0.1.2

## 0.3.0

### Patch Changes

- @scow/protos@0.1.1
- @scow/lib-slurm@0.1.1

## 0.2.0

### Minor Changes

- 84fcc4bf3: 增加配置日志输出选项功能
- 686054ac3: 增加 ListAvailableWms API
- 5cd477d37: 门户系统修改 getAppAttributes API 为 getAppMetadata，从 portal-server 获取应用名称

### Patch Changes

- 6814c3427: 交互式应用的自定义表单可以配置提示信息等
- Updated dependencies [6814c3427]
- Updated dependencies [c24e21662]
  - @scow/config@0.1.1
  - @scow/lib-config@0.1.1

## 0.1.2

## 0.1.1
