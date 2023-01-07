# 在开发环境下连接本地的vagrant集群

使用vagrant集群的LDAP、job table，但是使用本地开发环境的redis和scow数据库。

1. 启动`deploy/vagrant`下的vagrant集群
2. 给vagrant的每个机器(slurm, login, cn01, scow)配置root的免密登录
3. 在仓库根目录下，运行`npx pm2 start dev/vagrant/pm2.config.js`。访问以下URL以访问各个组件

| URL                   | 组件                             | 类型 |
| --------------------- | -------------------------------- | ---- |
| http://localhost:5000 | 认证系统                         | HTTP |
| http://localhost:5001 | 门户前端                         | HTTP |
| http://localhost:5002 | 门户后端                         | gRPC |
| http://localhost:5003 | 管理前端                         | HTTP |
| http://localhost:5004 | 管理后端                         | gRPC |
| http://localhost:3890 | 一个phpLDAPadmin，可用于管理LDAP | HTTP |

使用[pm2](https://pm2.keymetrics.io/)在本地启动多个开发用进程，可直接像`pnpm dev`一样，在本地修改文件后，对应系统自动更新。

常用命令（和docker compose差不多）

```bash
# 重启某个服务，服务名查看dev/vagrant/pm2.config.js，和compose中的服务名保持一致
npx pm2 restart portal-web

# 查看某个服务的log，加-f为一直查看最新的log
npx pm2 logs portal-web

# 停止所有服务
npx pm2 stop dev/vagrant/pm2.config.js
```

WSL2用户注意

- 目前Vagrant集群必须在Windows下启动，但是从WSL2下可以连接在Windows下的Virtualbox中启动的机器
- 请确保配置免密登录时，是把WSL2下的公钥添加到集群的机器中


