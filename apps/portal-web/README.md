# scow Web

# 开发和测试环境下的文件管理功能

在开发和测试环境下，hpc01集群的登录节点设置为localhost:22222，hpc02集群为localhost:22。

如果在本地22端口启动sshd服务，那么通过hpc02集群的文件管理功能可以直接管理本地文件。

```bash
# 在WSL下启动sshd服务，sshd服务将会在22端口启动
sudo /usr/bin/sshd
```

`pnpm devenv`将会在本地22222端口启动一个单独的ssh服务器用于测试。通过hpc01集群的文件管理可以管理这个SSH服务器的文件。