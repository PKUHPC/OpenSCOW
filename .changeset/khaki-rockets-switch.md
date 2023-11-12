---
"@scow/portal-web": patch
"@scow/lib-ssh": patch
---

sshConnect 时，提示语过长会使得连接失败，现在捕获了这个错误并提示用户
