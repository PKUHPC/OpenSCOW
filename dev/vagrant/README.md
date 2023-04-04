# 在开发环境下连接本地的vagrant集群

使用vagrant集群的slurm、LDAP、job table、SCOW的数据库和redis，但是在本地开发。

1. 启动`deploy/vagrant`下的vagrant集群
2. 给vagrant的每个机器(slurm, login, cn01, scow)配置root的公钥登录

```bash
# 集群各个机器的root用户的密码为vagrant

# 通过ssh-copy-id命令可以自动给节点配置公钥登录
# 运行后会要求输入root密码，输入vagrant即可

ssh-copy-id root@192.168.88.100
ssh-copy-id root@192.168.88.101
ssh-copy-id root@192.168.88.102
ssh-copy-id root@192.168.88.103
```

3. 打开redis和数据库的端口映射，使得本机可以访问这两个服务

给vagrant集群的`install.yaml`中增加以下部分，并运行`./cli compose up -d`重启服务。

```yaml title="install.yaml"

mis:
  portMappings:
    db: 3308

auth:
  portMappings:
    redis: 6379
```

4. 在仓库根目录下，运行`npx pm2 start dev/vagrant/pm2.config.js`启动各个服务
5. 访问以下URL以访问各个组件

| URL                   | 组件                             | 类型 |
| --------------------- | -------------------------------- | ---- |
| http://localhost:5000 | 认证系统                         | HTTP |
| http://localhost:5001 | 门户前端                         | HTTP |
| http://localhost:5002 | 门户后端                         | gRPC |
| http://localhost:5003 | 管理前端（无/mis前缀）           | HTTP |
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

WSL2和Dev Container用户注意

- 目前Vagrant集群必须在Windows下启动，但是从WSL2和Dev Container下可以连接在Windows下的Virtualbox中启动的机器
- 请确保配置免密登录时，是把WSL2或者Dev Container下的公钥添加到集群的机器中

理论上来说，只要修改本目录中的配置文件，可以连接到任何SCOW集群上开发测试。
