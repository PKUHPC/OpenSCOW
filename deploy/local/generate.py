# Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
# SCOW is licensed under Mulan PSL v2.
# You can use this software according to the terms and conditions of the Mulan PSL v2.
# You may obtain a copy of Mulan PSL v2 at:
#          http://license.coscl.org.cn/MulanPSL2
# THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
# EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
# MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
# See the Mulan PSL v2 for more details.

# encoding: utf-8

import json
import os
import stat
import config as cfg
import subprocess

def check_path_format(name, value):
    if value != "/" and value.endswith("/"):
        print(name + " should not end with /")
        exit(1)

# set default value
BASE_PATH = cfg.COMMON.get("BASE_PATH", "/")
check_path_format("COMMON.BASE_PATH", BASE_PATH)

PORTAL_PATH = "/"
if cfg.PORTAL and hasattr(cfg.PORTAL, "BASE_PATH"):
    PORTAL_PATH = cfg.PORTAL["BASE_PATH"]
check_path_format("PORTAL.BASE_PATH", PORTAL_PATH)

MIS_PATH = "/mis"
if cfg.MIS and hasattr(cfg.MIS, "BASE_PATH"):
    MIS_PATH = cfg.MIS["BASE_PATH"]
check_path_format("MIS.BASE_PATH", MIS_PATH)

class Service:
    def __init__(self, name, image, ports, volumes, environment):
        self.name = name
        self.image = image
        self.restart = "unless-stopped"
        self.ports = tuple_to_array(ports)
        self.volumes = dict_to_array(volumes)
        self.environment = dict_to_array(environment, True)
        self.logging = None
        self.depends_on = ["log"]
        if cfg.FLUENTD and self.name != "log":
            self.add_logging()
        else:
            self.depends_on = None

    def add_logging(self):
        self.logging = {
            "driver": "fluentd",
            "options": {
                "fluentd-address": "localhost:24224",
                "mode": "non-blocking",
                "tag": self.name
            }
        }


class Compose:
    def __init__(self):
        self.version = "3"
        self.services = {}
        self.volumes = {
            "db_data": {}
        }

    def add_service(self, sv):
        sv_dict = sv.__dict__
        element = sv_dict.pop("name")
        self.services[element] = clear_dict(sv_dict)


def clear_dict(d):
    if d is None:
        return None
    elif isinstance(d, list):
        return list(filter(lambda x: x is not None, map(clear_dict, d)))
    elif not isinstance(d, dict):
        return d
    else:
        r = dict(
            filter(lambda x: x[1] is not None,
                   map(lambda x: (x[0], clear_dict(x[1])),
                       d.items())))
        if not bool(r):
            return None
        return r


FLUENTD_IMAGE_TAG = "v1.14.0-1.0"
REDIS_IMAGE_TAG = "alpine"
MYSQL_IMAGE_TAG = "8"


def tuple_to_array(t):
    if t is None:
        return None
    arr = []
    for term in t:
        arr.append(term[0] + ":" + term[1])
    return arr


def dict_to_array(dict_data, *parameter):
    if dict_data is None:
        return None
    arr = []
    is_env = parameter[0] if len(parameter) > 0 else False
    for key in dict_data:
        if is_env:
            arr.append(key + "=" + dict_data[key])
        else:
            arr.append(key + ":" + dict_data[key])
    return arr

def get_value_or_default(obj, key, default):
    return obj[key] if key in obj else default

def generate_image(name, postfix):
    if postfix is None:
        return cfg.COMMON["IMAGE_BASE"] + "/" + name + ":" + cfg.COMMON["IMAGE_TAG"]
    else:
        return cfg.COMMON["IMAGE_BASE"] + "/" + name + "-" + postfix + ":" + cfg.COMMON["IMAGE_TAG"]

def create_log_service():
    # 创建日志收集目录 mkdir -p ***
    if os.path.exists(cfg.FLUENTD["LOG_DIR"]):
        print("log dir already exists!")
    else:
        os.makedirs(cfg.FLUENTD["LOG_DIR"])
        print("log dir created successfully!")

    os.chmod(cfg.FLUENTD["LOG_DIR"], stat.S_IRWXU | stat.S_IRWXG | stat.S_IRWXO)

    log_ports = [("24224", "24224"), ("24224", "24224/udp")]
    log_volumes = {
        cfg.FLUENTD["LOG_DIR"]: "/fluentd/log",
        "./fluent/fluent.conf": "/fluentd/etc/fluent.conf"
    }
    log = Service("log", "fluentd:" + FLUENTD_IMAGE_TAG, log_ports, log_volumes, None)
    return log


def create_gateway_service():
    gw_ports = [(str(cfg.COMMON["PORT"]), "80")]

    gw_env = {
        "BASE_PATH": "" if BASE_PATH == "/" else BASE_PATH,
        "PORTAL_PATH": PORTAL_PATH,
        "MIS_PATH": MIS_PATH,
    }

    gateway = Service("gateway", generate_image("gateway", None), gw_ports, {
        "/etc/hosts": "/etc/hosts",
    }, gw_env)
    return gateway


def create_auth_service():

    auth_service_name = "auth"

    au_volumes = {
        "/etc/hosts": "/etc/hosts",
        "./config": "/etc/scow",
        "~/.ssh": "/root/.ssh",
    }

    if hasattr(cfg, "AUTH") and cfg.AUTH is not None:

        if "VOLUMES" in cfg.AUTH:
            au_volumes.update(cfg.AUTH["VOLUMES"])

        return Service(
            auth_service_name,
            cfg.AUTH["IMAGE"],
            get_value_or_default(cfg.AUTH, "PORTS", None),
            au_volumes,
            get_value_or_default(cfg.AUTH, "ENV", None),
        )

    au_env = {
        "BASE_PATH": BASE_PATH,
    }

    auth = Service("auth", generate_image("auth", None), None, au_volumes, au_env)
    return auth


def create_portal_server_service():
    ps_volumes = {
        "/etc/hosts": "/etc/hosts",
        "./config": "/etc/scow",
        "~/.ssh": "/root/.ssh"
    }
    portal_server = Service("portal-server", generate_image("portal-server", None), None, ps_volumes, None)
    return portal_server


def create_portal_web_service():
    pw_env = {
        "MIS_URL": os.path.join(BASE_PATH, MIS_PATH),
        "MIS_DEPLOYED": "true" if cfg.MIS else "false"
    }
    pw_volumes = {
        "/etc/hosts": "/etc/hosts",
        "./config": "/etc/scow",
        # "~/.ssh": "/root/.ssh"
    }
    portal_web = Service("portal-web", generate_image("portal-web", cfg.PORTAL["IMAGE_POSTFIX"]), None,
                         pw_volumes, pw_env)
    return portal_web


def create_db_service():
    db_volumes = {
        "db_data": "/var/lib/mysql"
    }
    db_env = {
        "MYSQL_ROOT_PASSWORD": cfg.MIS["DB_PASSWORD"]
    }
    db = Service("db", "mysql:" + MYSQL_IMAGE_TAG, None, db_volumes, db_env)
    return db


def create_mis_server_service():
    ms_env = {
        "DB_PASSWORD": cfg.MIS["DB_PASSWORD"]
    }
    ms_volumes = {
        "/etc/hosts": "/etc/hosts",
        "./config": "/etc/scow",
        "~/.ssh": "/root/.ssh"
    }
    mis_server = Service("mis-server", generate_image("mis-server", None), None, ms_volumes, ms_env)
    return mis_server


def create_mis_web_service():
    mv_env = {
        "PORTAL_URL": os.path.join(BASE_PATH, PORTAL_PATH),
        "PORTAL_DEPLOYED": "true" if cfg.PORTAL else "false"
    }
    mv_volumes = {
        "./config": "/etc/scow",
    }
    mis_web = Service("mis-web", generate_image("mis-web", cfg.MIS["IMAGE_POSTFIX"]), None, mv_volumes, mv_env)
    return mis_web

def create_novnc_client():

    url = getattr(cfg.PORTAL, "NOVNC_IMAGE", "ghcr.io/pkuhpc/novnc-client-docker:master")

    return Service("novnc", url, None, None, None)

def create_services():
    com = Compose()

    if cfg.FLUENTD:
        com.add_service(create_log_service())

    com.add_service(create_gateway_service())
    com.add_service(create_auth_service())
    com.add_service(Service("redis", "redis:" + REDIS_IMAGE_TAG, None, None, None))

    if cfg.PORTAL:
        com.add_service(create_portal_web_service())
        com.add_service(create_portal_server_service())
        com.add_service(create_novnc_client())

    if cfg.MIS:
        com.add_service(create_db_service())
        com.add_service(create_mis_server_service())
        com.add_service(create_mis_web_service())

    return com


def chmod_shell_script(script_name):
    os.chmod(script_name, stat.S_IRWXU | stat.S_IRGRP | stat.S_IXGRP | stat.S_IROTH | stat.S_IXOTH)


def create_files():
    files = "docker-compose.json"
    if cfg.MIS:
        files = files + " and db.sh generated successfully!"
        # 生成 db.sh文件
        with open("db.sh", "w") as file:
            db_passwd = cfg.MIS["DB_PASSWORD"]

            content = "if docker compose &> /dev/null; then compose='docker compose';\n" \
                      "elif docker-compose &> /dev/null; then compose='docker-compose';\n" \
                      "else echo -e 'Docker Compose is not installed, refer to this connection for installation:\n" \
                      "https://docs.docker.com/compose/install/linux/#install-the-plugin-manually'; exit 1; fi\n" \
                      "$compose -f docker-compose.json  exec db mysql -uroot -p'" + db_passwd + "'"

            file.write(content)
            chmod_shell_script("db.sh")
    else:
        files = files + " generated successfully!"

    dc = create_services()
    com_json = json.dumps(dc.__dict__, skipkeys=True)
    str_json = json.loads(com_json)
    # 生成compose文件
    with open("docker-compose.json", "w") as json_file:
        json.dump(str_json, json_file, indent=4, ensure_ascii=False)

    return files


if __name__ == "__main__":
    print_info = create_files()

    print(print_info)
