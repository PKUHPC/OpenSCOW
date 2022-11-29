python generate.py

if docker compose &> /dev/null; then compose="docker compose";
elif docker-compose &> /dev/null; then compose="docker-compose";
else echo -e "\033[31mDocker Compose is not installed, refer to this connection for installation:\nhttps://docs.docker.com/compose/install/linux/#install-the-plugin-manually\033[0m"; exit 1; fi

$compose -f docker-compose.json $@
