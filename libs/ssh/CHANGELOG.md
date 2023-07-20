# @scow/lib-ssh

## 0.4.0

### Minor Changes

- 5b7f0e88f: 重构 scow，对接调度器适配器接口

## 0.3.0

### Minor Changes

- 1562ebbd2: 提交作业时增加 GPU 选项

### Patch Changes

- 5c066e4a5: 配置 SCOW 免密认证时，如果用户的 authorized_keys 已存在，则将 SCOW 的公钥插入，而不覆盖已有的 authorized_keys 文件

## 0.2.0

### Minor Changes

- 86e0f5b2d: 整个系统打包为一个镜像

### Patch Changes

- 419184a93: 统一处理多个 sftp 操作命令报错
