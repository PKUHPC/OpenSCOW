---
sidebar_position: 4
title: 内置认证系统配置 
---

# 内置认证系统配置

## 允许回调主机名

当登录完成后，认证系统将会回调到登录时传入的`callbackUrl`参数。为了保证安全性，认证系统默认只允许回调到和认证系统相同的主机名下。您可以通过配置`auth.yml`下的`allowedCallbackHostnames`配置项来配置允许回调的主机名。注意，主机名(hostname)不包括端口号。

```yaml title="config/auth.yml"
allowedCallbackHostnames：
  - localhost
  - another.com
```

## 验证码功能

在`auth.yaml`配置中，可以配置关于登录验证码的功能
  
```yaml title="config/auth.yml"
# 默认不启用登录验证码功能
# captcha:
  # enabled为true开启登录验证码功能
  # enabled: false
```
启用登录验证码时UI界面：

![验证码登录UI](./%E9%AA%8C%E8%AF%81%E7%A0%81%E7%99%BB%E5%BD%95UI.png)