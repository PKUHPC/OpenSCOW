# @scow/config

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
