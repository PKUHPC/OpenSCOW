# @scow/mis-server

## 0.8.1

## 0.8.0

### Minor Changes

- 5b7f0e88f: 重构 scow，对接调度器适配器接口

### Patch Changes

- 9da6fb5bc: 修复账户管理租户管理未结束作业查询结果不正确的问题，修复未结束作业批量搜索账户条件带入精确搜索中的问题
- 3f7afe8cb: 完善 mis-server 中针对 fetchJob 和 price 功能的测试，增大测试覆盖率
- e97eb22fd: 集群配置登录节点新增节点展示名
- 7a9973aa0: 修改 HTTP API 定义方式，去除生成 api-routes-schemas.json 步骤
- Updated dependencies [5b7f0e88f]
- Updated dependencies [62083044e]
- Updated dependencies [5c3c63657]
- Updated dependencies [e97eb22fd]
  - @scow/scheduler-adapter-protos@0.2.0
  - @scow/lib-scheduler-adapter@0.2.0
  - @scow/protos@0.3.0
  - @scow/config@0.4.0
  - @scow/lib-ssh@0.4.0
  - @scow/lib-hook@0.2.3
  - @scow/lib-server@0.2.0
  - @scow/lib-slurm@0.1.6

## 0.7.0

### Patch Changes

- 7df3b5e61: scow hook 中 accountBlocked、accountUnblocked 事件增加参数 tenantName
- b8b343894: 修复导入账户勾选加入白名单账户依然封锁问题
- d00ae0da3: 新增创建租户页面，同时创建该租户的管理员用户
- 17d8bcd31: 增加仅在 scow 数据库新增用户的 API
- 20a8d8925: 修改当从白名单移除账户时如果账户余额为 0 元则封锁账户
- 4bfd80986: 认证系统增加管理用户账户关系相关 API
- 487839e16: 租户信息管理员 id 展示 userId 修复
- 9e79e2a9f: 管理平台新增平台信息页面
- 81895f4be: mis.yaml 和 portal.yaml 中支持增加导航链接
- Updated dependencies [0f64e5404]
- Updated dependencies [4bfd80986]
- Updated dependencies [81895f4be]
  - @scow/config@0.3.1
  - @scow/lib-auth@0.2.1
  - @scow/protos@0.2.3
  - @scow/lib-hook@0.2.2
  - @scow/lib-server@0.2.0
  - @scow/lib-slurm@0.1.5

## 0.6.0

### Minor Changes

- 750a51e84: 修复用户从某些账号中移除但 slurm 并没有删除掉依赖关系从而导致仍然可以在该账号下提交作业的问题

### Patch Changes

- b78e1363f: 账户下的用户列表接口 response 增加 email 字段
- Updated dependencies [901ecdb7e]
- Updated dependencies [d2c8e765e]
- Updated dependencies [ce077930a]
  - @scow/config@0.3.0
  - @scow/lib-config@0.2.2
  - @scow/lib-hook@0.2.1
  - @scow/lib-server@0.2.0
  - @scow/protos@0.2.2
  - @scow/lib-slurm@0.1.4

## 0.5.0

### Minor Changes

- c2a8ab7a5: 删除认证系统验证用户姓名的 API，通过认证系统获取用户姓名和管理系统数据库实现
- 2ac7a9b4d: 当已存在的账户中有用户未导入，则可以勾选该账户并导入
- 7bd2578c4: SCOW API 增加静态 token 认证方法
- ef8b7eee0: 增加 SCOW Hook

### Patch Changes

- ff16142d3: 用户作业结算时，用户已用额度来源由租户作业费用改为账户作业费用
- 858c7a6c5: 创建用户时备注改为非必填，修复成功时不展示提示的问题
- e2c804923: 修改平台用户列表只能在第一页搜索用户问题；为了与租户管理的用户界面搜索统一，平台管理用户界面修改为模糊搜索
- d6e06e841: 读取配置文件时允许传入 logger 对象
- Updated dependencies [c2a8ab7a5]
- Updated dependencies [5c066e4a5]
- Updated dependencies [bb9d9bb8b]
- Updated dependencies [215ac2fc7]
- Updated dependencies [7bd2578c4]
- Updated dependencies [ef8b7eee0]
- Updated dependencies [9cb6822e6]
- Updated dependencies [74d718ba1]
- Updated dependencies [1562ebbd2]
- Updated dependencies [d6e06e841]
- Updated dependencies [cb90eb64b]
  - @scow/lib-auth@0.2.0
  - @scow/lib-ssh@0.3.0
  - @scow/config@0.2.0
  - @scow/lib-server@0.2.0
  - @scow/lib-hook@0.2.0
  - @scow/lib-config@0.2.1
  - @scow/protos@0.2.1
  - @scow/lib-slurm@0.1.3

## 0.4.0

### Minor Changes

- 86e0f5b2d: 整个系统打包为一个镜像
- db62f70af: 管理系统 GetJobs API 增加 start_bi_job_index 参数，用于获取从某一个 bi_job_index 开始的作业信息
- 0eb41fed5: 导入用户功能只支持导入默认租户

### Patch Changes

- bdc990a0c: 系统启动时，各个容器在日志中打印版本信息
- 0e02a46a0: 修复某些被封锁的账户仍能提交作业的 bug
- ece2b014d: 修复管理端的作业操作权限问题
- Updated dependencies [bdc990a0c]
- Updated dependencies [86e0f5b2d]
- Updated dependencies [419184a93]
- Updated dependencies [8145061ba]
  - @scow/utils@0.1.2
  - @scow/lib-decimal@0.2.0
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
- 1a6b992db: 完善平台管理的租户列表，新增租户的创建时间
- 4ecca3d1e: 检查默认计费项是否完备
- 2b3648839: 优化导入用户模块，以账户为单位导入

### Patch Changes

- 99f806a33: 管理系统增加刷新 slurm 封锁状态功能
- Updated dependencies [6814c3427]
- Updated dependencies [c24e21662]
  - @scow/config@0.1.1
  - @scow/lib-config@0.1.1
  - @scow/lib-decimal@0.1.1

## 0.1.2

## 0.1.1
