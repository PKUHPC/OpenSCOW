# @scow/portal-server

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
