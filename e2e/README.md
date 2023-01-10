# e2e tests

```bash
# e2e目录里

# 安装浏览器。目前我们只面向chromium
pnpm dlx playwright install chromium

# 接下来的命令需要以root身份运行，所以需要以root身份安装一下node
sudo volta install node

# Linux: 以下命令只能在Debian和Ubuntu系发行版上运行
sudo pnpm dlx playwright install-deps
# Arch Linux用户，应该装一个浏览器就可以
# WSL2/WSLg用户：装一个浏览器就可以
# paru -S chromium

# 运行测试
pnpm test:e2e

```