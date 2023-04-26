---
"@scow/lib-ssh": patch
---

配置 SCOW 免密认证时，如果用户的 authorized_keys 已存在，则将 SCOW 的公钥插入，而不覆盖已有的 authorized_keys 文件
