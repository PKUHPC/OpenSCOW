# @scow/config

## 1.1.0

### Minor Changes

- b33a2bd6bc: ui.yaml 下的 footer 增加 hostnameMap，其作用与 hostnameTextMap 一致，hostnameTextMap 在下一个大版本将会被删除
- b7f01512eb: 实现了跨集群传输模块
- 50d34d6ae3: 增加 scow 定时同步调度器用户封锁、账户封锁/解封状态的配置，可配置同步周期、是否启动

### Patch Changes

- 5bb922fe99: 增加集群配置文件中登录节点 LoginNode 地址唯一性验证
- ccbde14304: 使配置文件中文本配置项兼容国际化类型，实现自定义配置文本的国际化展示
- 29e4b1880a: ui.yaml 配置中的 hostnameMap 只可设置不带 port 的 hostname
- 8fc4c21f07: 增加交互式应用 appConfigSchema 中的应用说明配置项 appComment

## 1.0.0

### Major Changes

- 11f94f716: 发布 1.0

### Minor Changes

- ee89b11b9: 新增审计系统配置文件

### Patch Changes

- cb1e3500d: 在 mis.yaml 中增加可选填的自定义可查询消费类型 customChargeTypes
- Updated dependencies [11f94f716]
  - @scow/lib-config@1.0.0

## 0.5.0

### Minor Changes

- b96e5c4b2: 支持在导航栏右侧的用户下拉菜单中增加自定义链接
- f3dd67ecb: 增加用户通过代码自定义收费规则的功能

### Patch Changes

- 67911fd92: 增加 requireGpu 配置项
- 31dc79055: 在 mis.yaml 和 portal.yaml 下的 navLinks 中增加 openInNewPage 可选配置，默认为 false。修改一级导航配置项 url 变更为可选配置。
- 9f70e2121: 集群配置文件新增 priority，提供集群显示排序功能
- 6f278a7b9: portal 配置新增 desktopsDir, 保存登录节点桌面信息
- 1407743ad: 增加提交作业的命令框中的提示语句可配置

## 0.4.0

### Minor Changes

- 5b7f0e88f: 重构 scow，对接调度器适配器接口
- 5c3c63657: 集群配置文件增加登录节点桌面功能配置，TurboVNC 的安装路径配置，实现集群单独配置。

### Patch Changes

- 62083044e: 增加交互式应用配置文件中 logoPath 参数，实现用户自定义配置应用图标功能
- e97eb22fd: 集群配置登录节点新增节点展示名

## 0.3.1

### Patch Changes

- 0f64e5404: 交互式应用 URL 修改为/api/proxy/集群 ID/代理类型/节点 hostname/端口。如果有交互式应用在使用 get_ip 函数以生成 base path，请将 get_ip 调用修改为 hostname
- 81895f4be: 在 portal.yaml 和 mis.yaml 中增加 navLinks 来支持增加一级二级导航链接

## 0.3.0

### Minor Changes

- 901ecdb7e: 完全去除 mis.yaml 中 userIdPattern 配置。使 createUser.userIdPattern 过时，修改为使用 createUser.builtin.userIdPattern

### Patch Changes

- d2c8e765e: 优化创建交互式应用页面：在用户家目录下的 apps/app[Id]路径下存入上一次提交记录；创建了查找上一次提交记录的 API 接口，每次创建交互式应用时查找上一次提交记录，如果有则与当前集群下配置对比选择填入相应的值。
- Updated dependencies [ce077930a]
  - @scow/lib-config@0.2.2

## 0.2.0

### Minor Changes

- 7bd2578c4: SCOW API 增加静态 token 认证方法
- ef8b7eee0: 增加 SCOW Hook

### Patch Changes

- 9cb6822e6: 集群和应用配置文件可放在子文件夹中
- 74d718ba1: 集群配置文件 proxyGateway.autoSetupNginx 默认值改为 false
- cb90eb64b: 门户支持配置代理网关节点
- Updated dependencies [9cb6822e6]
- Updated dependencies [d6e06e841]
  - @scow/lib-config@0.2.1

## 0.1.2

### Patch Changes

- Updated dependencies [8145061ba]
  - @scow/lib-config@0.2.0

## 0.1.1

### Patch Changes

- 6814c3427: 交互式应用的自定义表单可以配置提示信息等
- c24e21662: publish .d.ts files
- Updated dependencies [c24e21662]
  - @scow/lib-config@0.1.1
