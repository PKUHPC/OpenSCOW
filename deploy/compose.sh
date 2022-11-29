# Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
# SCOW is licensed under Mulan PSL v2.
# You can use this software according to the terms and conditions of the Mulan PSL v2.
# You may obtain a copy of Mulan PSL v2 at:
#          http://license.coscl.org.cn/MulanPSL2
# THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
# EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
# MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
# See the Mulan PSL v2 for more details.

python3 generate.py

if docker compose &> /dev/null; then compose="docker compose";
elif docker-compose &> /dev/null; then compose="docker-compose";
else echo -e "\033[31mDocker Compose is not installed, refer to this connection for installation:\nhttps://docs.docker.com/compose/install/linux/#install-the-plugin-manually\033[0m"; exit 1; fi

$compose -f docker-compose.json $@
