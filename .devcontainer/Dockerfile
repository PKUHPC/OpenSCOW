FROM mcr.microsoft.com/devcontainers/typescript-node:18

# Install Buf command line tools
ARG BUF_VERSION="1.11.0"

RUN BIN="/usr/local/bin" && \
  VERSION="${BUF_VERSION}" && \
  curl -sSL \
  "https://github.com/bufbuild/buf/releases/download/v${VERSION}/buf-$(uname -s)-$(uname -m)" \
  -o "${BIN}/buf" && \
  chmod +x "${BIN}/buf"

RUN corepack enable
