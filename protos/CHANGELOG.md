# @scow/grpc-api

## 0.5.0

### Minor Changes

- 5b7f0e88f: 重构 scow，对接调度器适配器接口
- 5c3c63657: ListAvailableWms 新增传参集群 ID
- 6853606f8: shell 和桌面相关接口增加 login_node 参数

### Patch Changes

- 99e2b08e1: 创建交互式应用, 新增节点数，gpu 卡数及总内存传参
- 62083044e: 修改了 GetAppMetadata，ListAvailableApps，CreateAppSession 及 ListAppSessions 以满足增加集群查询参数，作业名，应用名及应用图标配置路径

## 0.4.1

### Patch Changes

- 7df3b5e61: scow hook 中 accountBlocked、accountUnblocked 事件增加参数 tenantName
- 17d8bcd31: 增加仅在 scow 数据库新增用户的 API
- d00ae0da3: 创建租户 api 修改，新增创建租户管理员用户逻辑
- 9e79e2a9f: 新增 getAdminInfo api 获取平台信息

## 0.4.0

### Minor Changes

- 8b36bf0bc: ListAppSessions 返回的 AppSession 中，去掉 ready 属性，增加 host 和 port，表示应用监听的主机和端口

### Patch Changes

- d2c8e765e: 优化创建交互式应用页面：在用户家目录下的 apps/app[Id]路径下存入上一次提交记录；创建了查找上一次提交记录的 API 接口，每次创建交互式应用时查找上一次提交记录，如果有则与当前集群下配置对比选择填入相应的值。
- b78e1363f: 账户下的用户列表接口 response 增加 email 字段

## 0.3.0

### Minor Changes

- c2a8ab7a5: 删除认证系统验证用户姓名的 API，通过认证系统获取用户姓名和管理系统数据库实现
- 2981664f4: 门户所有作业列增加开始、结束时间列，增加时间说明
- 2ac7a9b4d: 当已存在的账户中有用户未导入，则可以勾选该账户并导入
- aa4d0ff1c: 为 PENDING 等需要显示作业未运行原因的状态的 APP，显示原因
- ef8b7eee0: 增加 SCOW Hook
- 1c8d3e1c0: 提交作业时必须指定分区
- 1562ebbd2: 提交作业时增加 GPU 选项

### Patch Changes

- 858c7a6c5: 创建用户时备注改为非必填，修复成功时不展示提示的问题

## 0.2.0

### Minor Changes

- 882a247a1: 重构 app 的 sbatch options，gRPC 中与 custom_attributes 一起发送
- d4b0cde25: 创建 web 类交互式应用时由前端传入 base path，将节点名解析为 IP 地址的工作由 portal-server 完成
- db62f70af: 管理系统 GetJobs API 增加 start_bi_job_index 参数，用于获取从某一个 bi_job_index 开始的作业信息
- 0eb41fed5: 导入用户功能只支持导入默认租户

### Patch Changes

- 1c8a948d8: 把代码中 SavedJobs 字样全部改为 JobTemplate

## 0.1.3

### Patch Changes

- e7a5c8b8f: 在发布的文件中添加 buf.yaml
