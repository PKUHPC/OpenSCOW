# @scow/mis-web

## 1.0.0

### Major Changes

- 11f94f716: 发布 1.0

### Minor Changes

- ee89b11b9: 新增审计系统服务，记录门户系统及管理系统操作日志及展示

### Patch Changes

- cb1e3500d: 增加租户管理下和平台管理下的账户消费列表页面，优化账户消费列表显示
- 1fc3688b8: 暴露操作集群时后端返回的错误信息
- dfee2d354: 修复操作日志记录查不到用户信息报错问题
- d96e8ad91: auth 登录跳转回 web 页面时，判断 referer 是否包含 AUTH_EXTERNAL_URL + '/public/auth'以区分用户登录操作和切换门户/管理系统
- 8f0e51b3f: 管理系统用户可见分区查询时账户遍历时更改为 Promise.All()节省查询时间
- 946b1782a: 修改作业时限操作日志内容展示修复及创建操作日志错误捕获 bug 修复
- ffefb17b8: 修复账户添加用户提示语
- 3610e95da: portal-web 和 mis-web 的个人信息页面调整
- f784837d3: 增加租户管理、平台管理的账户列表封锁账户的功能
- 945bbb5ec: 作业详情数据添加单位
- 1bdccd827: 限制创建账户时的拥有者仅为当前租户下的用户
- 0fbba98dd: 用户、账户、作业称呼统一
- 1269e3cef: 操作日志搜索时间精度到秒，展示操作者姓名以及每页默认展示 50 条记录
- Updated dependencies [cb1e3500d]
- Updated dependencies [ee89b11b9]
- Updated dependencies [ee89b11b9]
- Updated dependencies [946b1782a]
- Updated dependencies [a8034f395]
- Updated dependencies [cb1e3500d]
- Updated dependencies [11f94f716]
  - @scow/lib-web@1.0.0
  - @scow/config@1.0.0
  - @scow/lib-operation-log@2.0.0
  - @scow/protos@1.0.0
  - @scow/lib-auth@1.0.0
  - @scow/lib-decimal@1.0.0
  - @scow/lib-config@1.0.0
  - @scow/utils@1.0.0

## 0.9.0

### Minor Changes

- 1c5e3a307: 平台管理中增加租户列表显示
- b96e5c4b2: 支持在导航栏右侧的用户下拉菜单中增加自定义链接
- 113e1e4ea: 管理系统中，租户/平台管理员修改自己管理的用户密码时无需原密码
- f3dd67ecb: 增加用户通过代码自定义收费规则的功能

### Patch Changes

- 75951b5bb: 租户管理下账户列表，白名单账户显示优化；增加账户统计信息，用户数量显示等功能。
- 31dc79055: 增加是否打开新的页面配置项，默认为 false,所有导航点击时不打开新的页面；修改一级导航 url 配置项为可选，没有配置时 则默认跳转次级第一个导航的 url
- f9fbd4cd2: 租户管理中拆分租户和账户充值记录查询，平台管理中租户查询充值记录时可以下拉选择租户
- 666567732: 之前历史作业批量搜索和精确搜索的条件分割有误，精确搜索会带上批量搜索的一些条件，现在各自搜索只会带上自己的条件
- d49a34986: 优化租户管理和平台管理的用户列表，增加各角色用户总数显示，优化显示文字及列表结果排序
- 9fd95a97a: 为作业详情页的作业执行时间，作业等待时间，作业时间限制添加单位说明
- 572530a01: mis-web 用户修改邮箱,用户原邮箱直接展示且不可修改，用户填写符合规则的新邮箱后即可直接修改邮箱。
- da5edd22c: 在集群与分区信息页面，实现仅显示用户有使用权限的分区信息
- 6e0d03044: 解决开发环境下 mis-web 进入 dashboard 页面报错的问题
- 12ecb668e: 修复多次点击用户空间-已结束作业列表，接口会自动加上账户筛选条件的问题
- 143c9732e: 之前：退出登录或登陆过期时跳转到需要登录页面，现在：直接跳转到登录页面
- 291f1d471: mis-web 管理系统 UI 文字和栏目优化。mis-server 返回租户信息中增加租户财务人员，返回平台信息中增加平台财务人员。
- 2f3b9e98d: 管理系统集群名展示改为集群的 displayName
- 0f8ade56c: 租户管理员增加账户管理员的所有权限，比如添加用户、限额、封锁、设为管理员和移除用户。
- 01559259c: 修复 setAsInitAdmin.ts 和 unsetInitAdmin.ts 文件命名错误
- 6522b47cf: 修改作业时限优化，将增加减少时限改为直接设置作业时限，并且检查是否大于作业的运行时间
- 8dcfc3f1a: 增加作业列表中 GPU 卡数的展示
- 5362b438c: 修改平台管理获取账户列表的权限
- 4b12bed3f: 修改管理系统用户空间集群分区的计量方式显示，修改为与作业价格表中显示方式一致
- cce9d6c92: 取消用户限额时可选择是否同时解除对用户的封锁
- f3d9849ce: 复用账户列表组件，除个别特殊显示外实现平台管理下的账户列表与租户管理下的账户列表功能统一
- ba67cac99: 修复 Schema 中使用 Type.Union([Type.String(), Type.Undefined()])错误，改为 Type.Optional(Type.String())
- 1c668544f: 增加 hook：jobsSaved，此 hook 在作业信息持久化到 scow 数据库后调用
- c84ff2eb8: 为租户管理员增加租户财务人员权限和平台管理员增加平台财务人员权限
- Updated dependencies [75951b5bb]
- Updated dependencies [67911fd92]
- Updated dependencies [113e1e4ea]
- Updated dependencies [1c74443b6]
- Updated dependencies [b96e5c4b2]
- Updated dependencies [d49a34986]
- Updated dependencies [31dc79055]
- Updated dependencies [572530a01]
- Updated dependencies [9f70e2121]
- Updated dependencies [6f278a7b9]
- Updated dependencies [6522b47cf]
- Updated dependencies [1407743ad]
- Updated dependencies [53e596584]
- Updated dependencies [f3dd67ecb]
- Updated dependencies [9f70e2121]
  - @scow/lib-web@0.4.0
  - @scow/config@0.5.0
  - @scow/lib-auth@0.3.0
  - @scow/protos@0.3.1

## 0.8.1

### Patch Changes

- a978233fe: 修复 antd 主题没有应用完全的问题
- Updated dependencies [a978233fe]
  - @scow/lib-web@0.3.5

## 0.8.0

### Minor Changes

- 5b7f0e88f: 重构 scow，对接调度器适配器接口

### Patch Changes

- 9da6fb5bc: 修复账户管理租户管理未结束作业查询结果不正确的问题，修复未结束作业批量搜索账户条件带入精确搜索中的问题
- bbbb040c9: 用户不属于任何一个账户时仪表盘不展示未完成作业列表
- 4c71a2a4b: 账户充值和租户充值允许负数
- d668f50ff: 租户管理历史作业页面打开时作业结束时间的查询时分秒修改为 00:00:00-23:59:59
- 7d2ac2666: 修复平台信息页面角色权限校验错误问题
- 7a9973aa0: 修改 HTTP API 定义方式，去除生成 api-routes-schemas.json 步骤
- 4a7229dbd: 修复集群和分区信息展示界面中核心数、gpu 数、内存量展示为分区总数的问题
- Updated dependencies [5b7f0e88f]
- Updated dependencies [62083044e]
- Updated dependencies [a90e34b30]
- Updated dependencies [5c3c63657]
- Updated dependencies [e97eb22fd]
  - @scow/protos@0.3.0
  - @scow/config@0.4.0
  - @scow/lib-web@0.3.4

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
