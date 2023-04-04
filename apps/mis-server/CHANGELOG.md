# @scow/mis-server

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
