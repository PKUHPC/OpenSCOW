# @scow/mis-web

## 0.4.0

### Minor Changes

- 86e0f5b2d: 整个系统打包为一个镜像
- 50a5b858c: 系统初试化页面用户选择下拉框支持搜索
- 0eb41fed5: 导入用户功能只支持导入默认租户

### Patch Changes

- fb2af3d6c: 修复充值记录查询的 bug
- bdc990a0c: 系统启动时，各个容器在日志中打印版本信息
- 584069cfd: 修复账户管理下的作业列表，只能正常显示第一个账户的数据的问题
- debcf7bc3: 从最终镜像中去除 next.js build cache，减小镜像大小
- 5deada9da: 初始化页面获取丢失默认价格接口不做登录校验
- ff7eec37e: 修复因 table 超出页面的问题，搜索模块、个人信息页面手机端样式兼容
- 06cd94230: 刷新 slurm 封锁状态和同步作业信息状态功能放到平台调试中
- 8b666552e: 解决再次添加用户不成功的问题
- ece2b014d: 修复管理端的作业操作权限问题
- 0ed5d925e: ID 为空时精确搜索页面展示搜索结果
- Updated dependencies [bdc990a0c]
- Updated dependencies [86e0f5b2d]
- Updated dependencies [ff7eec37e]
- Updated dependencies [8145061ba]
  - @scow/utils@0.1.2
  - @scow/lib-decimal@0.2.0
  - @scow/protos@0.2.0
  - @scow/lib-web@0.3.0
  - @scow/lib-config@0.2.0
  - @scow/config@0.1.2

## 0.3.0

### Minor Changes

- 73939f15f: 在租户计费价格表中使用新的 ui

### Patch Changes

- @scow/protos@0.1.1

## 0.2.0

### Minor Changes

- b6f28ba26: 优化平台管理部分的计费价格模块
- 1a6b992db: 完善平台管理的租户列表，新增租户的创建时间
- c55bfd32d: 在初始化界面使用新的计费 UI
- 4ecca3d1e: 检查默认计费项是否完备
- 2b3648839: 优化导入用户模块，以账户为单位导入
- 5e4f6ac58: 支持动态设置 base path
- a9b64169c: 更新 LOGO、favicon、仪表盘图片的自定义方式

### Patch Changes

- 99f806a33: 管理系统增加刷新 slurm 封锁状态功能
- 2ba2c8b47: 给账户添加用户时，如果用户不存在，弹出创建用户 modal 创建完成后，自动将用户加入到账户中
- b6347a367: 更新 next.js 版本并开启自动更新
- 93eb54ea6: 修复图片没有正确加上 base path
- Updated dependencies [c2a1dff41]
- Updated dependencies [93eb54ea6]
- Updated dependencies [5e4f6ac58]
- Updated dependencies [a9b64169c]
- Updated dependencies [6814c3427]
- Updated dependencies [c24e21662]
  - @scow/lib-web@0.2.0
  - @scow/config@0.1.1
  - @scow/lib-config@0.1.1
  - @scow/lib-decimal@0.1.1
  - @scow/utils@0.1.1

## 0.1.2

## 0.1.1
