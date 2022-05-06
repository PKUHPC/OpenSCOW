# 把此文件放到slurm脚本的目录下运行

import json
import subprocess

output = "users.json"

o = subprocess.Popen("./slurm -l all", shell=True, stdout=subprocess.PIPE)

lines = [s.decode().strip() for s in o.stdout.readlines()]

obj = {
    "accounts": {},
    "names": {},
}

i = 0
while i < len(lines):
    account = lines[i]
    obj["accounts"][account] = {}
    i+=1
    owner = None
    while lines[i].strip() != "":
        user, status = [i.strip() for i in lines[i].split(":")]
        if account == "a_" + user:
            if owner:
                print("Account {} already has an owner {}. Ignoring".format(account, owner))
            else:
                status += ",owner"
                owner = user
        obj["accounts"][account][user] = status
        i+=1
    if not owner:
        print("Account {} doesn't have an owner".format(account))
    i+=1

with open(output, "w") as f:
    json.dump(obj, f, ensure_ascii=False)
