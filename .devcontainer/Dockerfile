FROM mcr.microsoft.com/devcontainers/universal:2-linux

# Install volta
RUN curl https://get.volta.sh | bash

# Install pnpm
RUN curl -fsSL https://get.pnpm.io/install.sh | sh -

# Install Buf command line tools
ARG BUF_VERSION="1.11.0"

RUN BIN="/usr/local/bin" && \
  VERSION="${BUF_VERSION}" && \
  curl -sSL \
  "https://github.com/bufbuild/buf/releases/download/v${VERSION}/buf-$(uname -s)-$(uname -m)" \
  -o "${BIN}/buf" && \
  chmod +x "${BIN}/buf"


# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node modules
# RUN su node -c "npm install -g <your-package-list-here>"
