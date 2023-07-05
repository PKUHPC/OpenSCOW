---
slug: update-portal-app
title: 交互式应用配置更新
authors: []
tags: [scow, scow-portal-apps, scow-apps]

---

上一个版本，在SCOW门户系统的交互式应用下，我们通过在`config/apps`下配置的交互式应用，实现创建各个集群下均可以使用的交互式应用。
但是考虑到不同集群的计算机节点下安装环境不同，可能无法满足对所有获取到的交互式应用的正常使用。

为了让大家更方便、高效地管理和使用SCOW集群，我们在新版本的交互式应用配置部分，实现了以下功能：

- 实现在`config/clusters/{集群ID}/apps`下对特定集群可以使用的交互式应用进行单独配置
- 同时有效兼容旧版本`config/apps`下所有集群均可以使用的交互式应用配置
- 交互式应用配置增加可选自定义图标配置，在创建应用页面实现交互式应用图标可视化管理

详细说明可参考SCOW`部署和配置`下的[多集群下的应用配置](%DOCS_URL%%BASE_PATH%docs/deploy/config/portal/apps/configure-cluster-apps.md)。
