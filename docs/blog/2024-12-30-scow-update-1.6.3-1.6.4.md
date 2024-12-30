---
slug: scow-update-to-v1.6.4
title: OpenSCOW: 1.6.3升级到1.6.4
authors: [huangjun]
tags: [scow, scow-deployment, v1.6.4]

---

# 1. 修改install.yaml

进入scow部署目录，修改`install.yaml`，修改`imageTag`的值，将其改为：v1.6.4

```yaml
#...
imageTag: v1.6.4
#...
```

# 2. 拉取镜像

```bash
./cli compose pull mis-web
```

# 3. 重启SCOW

```bash
./cli compose down
./cli compose up -d
```

`./cli compose ps`查看容器状态，当所有容器状态都为UP时表示升级成功。

```yaml
root@scow:~/scow-cli# ./cli compose ps
INFO: Loaded plugins: ["xscow-agent"]
INFO: Using docker compose config from ./plugins/xscow-agent/docker-compose.yml of plugin xscow-agent
NAME                       IMAGE                                         COMMAND                  SERVICE         CREATED              STATUS              PORTS
scow-cli-audit-db-1        mysql:8                                       "docker-entrypoint.s…"   audit-db        About a minute ago   Up About a minute   3306/tcp, 33060/tcp
scow-cli-audit-server-1    mirrors.pku.edu.cn/pkuhpc-icode/scow:v1.6.4   "./entrypoint.sh"        audit-server    About a minute ago   Up 53 seconds       80/tcp, 3000/tcp, 5000/tcp
scow-cli-auth-1            mirrors.pku.edu.cn/pkuhpc-icode/scow:v1.6.4   "./entrypoint.sh"        auth            About a minute ago   Up About a minute   80/tcp, 3000/tcp, 5000/tcp
scow-cli-db-1              mysql:8                                       "docker-entrypoint.s…"   db              About a minute ago   Up About a minute   3306/tcp, 33060/tcp
scow-cli-gateway-1         mirrors.pku.edu.cn/pkuhpc-icode/scow:v1.6.4   "./entrypoint.sh"        gateway         About a minute ago   Up About a minute   3000/tcp, 0.0.0.0:80->80/tcp, :::80->80/tcp, 5000/tcp
scow-cli-log-1             fluentd:v1.14.0-1.0                           "tini -- /bin/entryp…"   log             About a minute ago   Up About a minute   5140/tcp, 0.0.0.0:24224->24224/tcp, 0.0.0.0:24224->24224/udp, :::24224->24224/tcp, :::24224->24224/udp
scow-cli-mis-server-1      mirrors.pku.edu.cn/pkuhpc-icode/scow:v1.6.4   "./entrypoint.sh"        mis-server      About a minute ago   Up 52 seconds       80/tcp, 3000/tcp, 5000/tcp
scow-cli-mis-web-1         mirrors.pku.edu.cn/pkuhpc-icode/scow:v1.6.4   "./entrypoint.sh"        mis-web         About a minute ago   Up About a minute   80/tcp, 3000/tcp, 5000/tcp
scow-cli-novnc-1           ghcr.io/pkuhpc/novnc-client-docker:master     "/docker-entrypoint.…"   novnc           About a minute ago   Up About a minute   80/tcp
scow-cli-portal-server-1   mirrors.pku.edu.cn/pkuhpc-icode/scow:v1.6.4   "./entrypoint.sh"        portal-server   About a minute ago   Up 48 seconds       80/tcp, 3000/tcp, 5000/tcp
scow-cli-portal-web-1      mirrors.pku.edu.cn/pkuhpc-icode/scow:v1.6.4   "./entrypoint.sh"        portal-web      About a minute ago   Up About a minute   80/tcp, 3000/tcp, 5000/tcp
scow-cli-redis-1           redis:alpine                                  "docker-entrypoint.s…"   redis           About a minute ago   Up About a minute   6379/tcp
scow-cli-xscow-agent-1     ccimage.pku.edu.cn/xscow-agent/agent:pr-316   "docker-entrypoint.s…"   xscow-agent     About a minute ago   Up 48 seconds       3000/tcp, 0.0.0.0:23974->23974/tcp, :::23974->23974/tcp
```
