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

## 模仿用户

如果登录用户的ID为某个key，那么实际将会以其对应的value的用户登录。修改此配置无需重启认证系统。

```yaml title="config/auth.yml"
mockUsers:
  # 当登录用户的ID为fromUser1，实际上以toUser1登录
  fromUser1: toUser1
  fromUser2: toUser2
```


## OTP功能

在`auth.yaml`配置中，可以配置关于登录验证码的功能

但是请注意：

  1. 目前仅支持ldap认证方式启用otp，ssh方式不支持。
  2. 手机端您可以使用FreeOTP, authenticator等，但是请注意有的手机端app可能不支持配置OTP码的digits和加密方式等。
  3. 您需要自己在ldap中定义一个属性名用来存储string类型的OTP密钥,并配置为auth.yaml中的opt.secretAttributeName。
  4. 您需要配置一个邮件传输代理（MTA）以实现邮件服务。其中，您需要提供有效的发件人地址、SMTP 服务器地址、SMTP 服务器端口号以及 SMTP 认证凭据（包括用户名和授权码）。
  5. 如果您的密钥要自己存储在某个地方（即otp.status为remote），那么您需要提供一个验证otp码的接口，返回验证的结果。返回结果用string类型false或者true字符串即可。scow会使用fetch向config/auth.yml中的otp.remote.url发起请求。

  | fetch| |
  |:----:|:---------------------------------: |
  |headers|"Content-Type": "application/json" |
  | body  | OTPCode, userId                   |

比如您是像Google Authenticator一样将密钥存在用户家目录下的.google_authenticator第一行内容，那么您可以提供的路由接口及服务示例：

```
import { Static, Type } from "@sinclair/typebox";
import fastify from "fastify";
import { NodeSSH } from "node-ssh";
import * as speakeasy from "speakeasy";
// 远程验证OTP码
const app = fastify({ logger: true });
const bodySchema = Type.Object({
  OTPCode: Type.String(),
  userId: Type.String(),
});

/**
 * 假设您的OTP密钥存放主机host="192.168.88.102"上/data/home/{{userId}}/.google_authenticator文件的第一行内容，其中{{userId}}为实际的用户名
 * 可以以root身份ssh登录到目标主机的私钥地址为/home/node/.ssh/id_rsa
 */

const host = "192.168.88.102";
const sshUserName = "root";
const homedir = "/data/home/{{ userId }}";
// routePath需要您与配置的auth.yaml中otp.remote.url的路径一致
const routePath = "/otp/remote/validateCode";

// 假设私钥路径为/home/node/.ssh/id_rsa
const privateKeyPath = "/home/node/.ssh/id_rsa";

app.post<{Body: Static<typeof bodySchema>}>(
  routePath,
  {
    schema: {
      body: bodySchema,
    },
  },
  async (req, res) => {
    // OTPCode为scow的fetch请求携带的OTP验证码，userId为OTP验证的用户名
    const { OTPCode, userId } = req.body;
    const ssh = new NodeSSH();
    // 获取OTP密钥
    const OTPSecret = await ssh.connect({ host: host, username: sshUserName, privateKeyPath: privateKeyPath })
      .then(async () => {
        const OTPSecretFilePath = homedir.replace("{{ userId }}", userId) + "/.google_authenticator";
        const fileContent = await ssh.execCommand(`su ${userId} && cat ${OTPSecretFilePath}`);
        return fileContent.stdout.toString().split("\n")[0];
      }).finally(() => {
        ssh.dispose();
      });
    // 获取绝对时间戳
    const currentTime = new Date();
    const timeStamp = Date.UTC(currentTime.getUTCFullYear(), currentTime.getUTCMonth(), currentTime.getUTCDate(),
      currentTime.getUTCHours(), currentTime.getUTCMinutes(), currentTime.getUTCSeconds(),
      currentTime.getUTCMilliseconds());
      // 验证
    const result = speakeasy.totp.verify({
      token: OTPCode,
      time: timeStamp / 1000,
      encoding: "base32",
      secret: OTPSecret,
      // digits, step, algorithm需要您与手机端保持一致
    });
    res.send(result);
  },
);

export const start = async () => {
  await app.listen({ port: 9999 });
};
start();

```

auth.yaml:
```yaml title="config/auth.yml"
otp:
  #status指定otp状态，分别为disabled:不启用,local：启用为本地模式，remote：启用为远程认证模式。默认为disabled
  status: local
  #密钥存储属性名,需要定义
  secretAttributeName: secret
  #认证系统地址，例如：http://localhost:5000
  authUrl: http://localhost:5000
  #OTP码位数，默认为6
  #digits: 6
  #加密算法(sha1，sha256，sha512)，默认为sha1,
  #algorithm: sha1
  #OTP码有效时间，默认为30
  #period: 30
  #绑定otp时发送绑定信息方式
  authenticationMethod:
    mail:
      enabled: true
      #发件邮箱地址
      from: "example@excample.com"
      #邮件主题，默认为"otp绑定链接"
      #subject: "otp绑定链接"
      #邮件内容标题，默认为"Bind OTP"
      #title: "Bind OTP"
      #邮件内容,默认为"Please click on the following link to bind your OTP:"
      #contentText: "Please click on the following link to bind your OTP:"
      #标签点击文字,默认为"Bind OTP"
      #labelText: "Bind OTP"
      #secret二维码上方文字描述信息, 默认为"此二维码仅出现一次，用过即毁"
      #qrcodeDescription:
      mailTransportInfo:
        #SMTP服务器
        host: "smtp.ethereal.email"
        #是否启用安全连接，默认false
        secure: false
        port: 587
        #SMTP身份验证用户名
        user: "morgan68@ethereal.email"
        #SMTP身份验证授权码
        password: "y2es3bd3rYwxWs5n8g"
  #如果mode指定为remote，需要配置以下认证url
  remote:
    #远程验证url，例如http://localhost:5000/otp/remote/validateCode
    url: 
    #当用户点击绑定OTP时，302重定向的链接，例如https://pkuhpc.github.io/SCOW/
    redirectUrl: 


```

