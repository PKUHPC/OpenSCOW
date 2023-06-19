# @scow/mis-web

## 0.7.0

### Patch Changes

- 1aad4a345: 去掉 web 端多余的逗号
- 1227c7347: 修复导入用户时账户选择默认拥有者提交无效问题
- 31198304c: portal-web 使用 custom server 注册 upgrade 事件，更新 next.js 至最新并恢复日常更新
- d00ae0da3: 新增创建租户页面，同时创建该租户的管理员用户
- e011f42ff: 门户和管理系统添加 footer 展示 SCOW 版本和 github 跳转链接
- 8cf189cd2: 修改了 config 中 ENABLE_CHANGE_PASSWORD 与 authSupportsCreateUser 的类型属性可以为 Undefined
- 07160d9de: 修改了管理系统用户空间集群和分区信息页面集群项跨越行数显示不正确的问题
- 9e79e2a9f: 管理平台新增平台信息页面
- 81895f4be: mis.yaml 和 portal.yaml 中支持增加导航链接
- Updated dependencies [31198304c]
- Updated dependencies [e011f42ff]
- Updated dependencies [0f64e5404]
- Updated dependencies [4bfd80986]
- Updated dependencies [81895f4be]
- Updated dependencies [81895f4be]
  - @scow/lib-web@0.3.3
  - @scow/config@0.3.1
  - @scow/lib-auth@0.2.1
  - @scow/protos@0.2.3

## 0.6.0

### Minor Changes

- 901ecdb7e: 支持使用外部页面创建用户

### Patch Changes

- dc51bfde6: 浏览器关闭后，用户登录 cookie 失效
- 01e18fa28: 临时解决 Shell 和 VNC 类应用不可用的问题
- ed073f9ac: 管理系统右上角用户名以管理系统数据库为准
- f5e1d45ab: 管理系统导入账户时, 在没有拥有者的情况下账户拥有者默认选择账户的第一个用户
- Updated dependencies [901ecdb7e]
- Updated dependencies [01e18fa28]
- Updated dependencies [d2c8e765e]
- Updated dependencies [ce077930a]
  - @scow/config@0.3.0
  - @scow/lib-web@0.3.2
  - @scow/lib-config@0.2.2
  - @scow/protos@0.2.2

## 0.5.0

### Minor Changes

- c2a8ab7a5: 删除认证系统验证用户姓名的 API，通过认证系统获取用户姓名和管理系统数据库实现
- 2ac7a9b4d: 当已存在的账户中有用户未导入，则可以勾选该账户并导入

### Patch Changes

- 5cc5ef9a5: 修复账户管理员在账户管理页面搜索账户充值记录时，除首次搜索外丢失 accountName 参数名导致接口报错无权限问题
- 9c5c3c11c: 租户列表余额展示精确到 3 位小数，租户充值时金额只精确到 2 位小数
- e833bdb74: 修复创建用户时，管理系统后端没有检查新用户的 ID 是否符合配置文件中定义的规则
- 70ab2e1d7: 修复用户空间-已结束作业批量搜索的账户条件会带入到精确搜索中
- c3907e855: 管理系统设置价格时允许设置为 0 元
- fc36c57ca: 修复 web 项目第一次访问时页面布局混乱的问题
- fc01bce1b: 租户历史作业计费价格表不显示平台计费项
- 858c7a6c5: 创建用户时备注改为非必填，修复成功时不展示提示的问题
- 2abcb9e40: 修复了一个 bug，曾导致当用户修改集群配置后，无法计算出正确的计费项 id
- 977600e34: 修复了一个 bug，该 bug 曾导致分页情况下导入的账户没有拥有者
- 8268e348e: 修改 DELETE 请求 body 为 query 使其合规
- e2c804923: 修改平台用户列表只能在第一页搜索用户问题；为了与租户管理的用户界面搜索统一，平台管理用户界面修改为模糊搜索
- 4e05475c0: 管理系统修改没有设置创建用户 ID 正则规则时无法启动 mis-web 的问题
- 8c5751582: 平台管理租户充值记录过滤条件 tenantName 手动清空时，传参由“”改为 undefined
- 230a8f07c: 修复租户财务人员获取租户下的所有账号信息无权限，平台财务人员访问平台下的所有租户信息无权限问题
- caefcddcd: 前端显示用户姓名时使用认证系统返回的用户姓名
- d6e06e841: 读取配置文件时允许传入 logger 对象
- 40b98669e: 租户管理页面可以查看作业价格表的历史记录
- Updated dependencies [c2a8ab7a5]
- Updated dependencies [bb9d9bb8b]
- Updated dependencies [215ac2fc7]
- Updated dependencies [fc36c57ca]
- Updated dependencies [7bd2578c4]
- Updated dependencies [ef8b7eee0]
- Updated dependencies [9cb6822e6]
- Updated dependencies [74d718ba1]
- Updated dependencies [caefcddcd]
- Updated dependencies [d6e06e841]
- Updated dependencies [cb90eb64b]
  - @scow/lib-auth@0.2.0
  - @scow/lib-web@0.3.1
  - @scow/config@0.2.0
  - @scow/lib-config@0.2.1
  - @scow/protos@0.2.1

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
