# 在开发环境下连接本地的vagrant集群

使用vagrant集群的LDAP、job table，但是使用本地开发环境的redis和数据库。

1. 启动`deploy/vagrant`下的vagrant集群
2. 给计算节点、登录节点配置root的免密登录
3. 在仓库根目录下，运行`npx pm2 start dev/vagrant/pm2.js`