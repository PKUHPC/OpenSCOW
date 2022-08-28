

#!/bin/bash

usage="Usage: ./slurm [OPTION]...[PARAM]...
    -c, -C, --addAcct            add an account to ldap and slurm partition
    -g, -G, --addToAcct          add user to an exist account
    -e, -E, --addExclNode        add exclusive nodes to users
    -v, -V, --delUser            delete user
    -k, -K, --delFromAcct        delete user from an account
    -a, -A, --delAcct            delete account
    -d, -D, --addAllowAcct       allow an account to use resources
    -b, -B, --blockAcct          block an account
    -q, -Q, --queryAcct          query whether an account is allowed
    -m, -M, --queryAcctBatch     query whether a batch of accounts are allowed
    -f, -F, --blockUser          block a user
    -j, -J, --allowUser          allow a user access to resources
    -u, -U, --queryUser          query whether a user is allowed
    -o, -O, --blockUserfromAcct  block a user from an account
    -r, -R, --allowUserfromAcct  allow a user from an account
    -s, -S, --queryUserInAcct    query whether user is allowed in account
    -p, -P, --AllUserInAcct      query all user in acct whether it is blocked
    -l, -L, --AllUserInAllAcct   query all user in all acct whether it is blocked
    -z, -Z, --addQuota           add quota to a user (T)
    -w, -W, --decreaseQuota      cut down the quota to a user (T)
    -x, -X, --setQuota           set quota to a user (T)
    -y, -Y, --queryQuota         query how many quota the user has
    -n, -N, --changeTimelimit    add or decrease time to a job (minute)
    -t, -T, --queryJobTime       query timelimit of a job
    -h, -H, --help               display this help and exit
"
#     -s, -S, --addShareNode       add share nodes to users


USE='Usage: ./slurm [OPTION]...[PARAM]...

use "./slurm --help" to find some help!'

nocommand="Error: No command specified."

addUser="Usage:  add user to ldap and slurm partition
    -i, -I, --addUser        add user to ldap and slurm partition
./slurm -i 0/1 username password
example:
user is on campus:   ./slurm -i 0 campusID
user is off campus:  ./slurm -i 1 userId password
"
addAcct="Usage: add an account to ldap and slurm partition, and specify the owner of the account
./slurm -c account 0/1 username password
example:
add an account named test, and the owner is campus user Ashlee: ./slurm -c test 0 Ashlee
add an account named test, and the owner is offCampus user Ashlee: ./slurm -c test 1 Ashlee password
"
addToAcct="Usage: add user to an exist account
./slurm -g account 0/1 username password
example:
add campus user Ashlee to an exist account named test: ./slurm -g test 0 Ashlee
add offCampus user Ashlee to an exist account named test: ./slurm -g test 1 Ashlee password
"
addShareNode="Usage: add share nodes to users
./slurm -s  account partition nodenumber
example:
add 5 nodes in Par2 to an account test:    ./slurm -s test Par2 5
"
addExclNode="Usage:  add exclusive nodes to users
./slurm -e account partition nodenumber
example:
add 5 nodes in Par2 to an account test:    ./slurm -e test Par2 5
"
delUser="Usage: delete user
 ./slurm -v userID   delete user
example:
delete user named test:  ./slurm -v test
"
delFromAcct="Usage: delete users from an account
 ./slurm -k account userID1 userID2   delete user from an account
example:
delete user user1 and user2 from account named test:  ./slurm -k test user1 user2
"
delAcct="Usage: delete account
./slurm -a account
example:
delete an account names test:  ./slurm -a test
"
delExclNode="Usage: delete exclusive nodes of an account
./slurm -n account
example:
delete exclusive nodes of account named test, if nodes's within the range of 01-05,set this nodes to partition test1, else set to partition test2
./slurm -n test
"
delShareNode="Usage: delete share nodes of an account
./slurm -t account partition
example:
delete share nodes of account named test
./slurm -t test
"
addAllowAcct="Usage: allow an account use resources
./slurm -d account
example:
allow an account named test to use resources
/slurm -d test
"
blockAcct="Usage: block an account
./slurm -b account
example:
block an account named test
./slurm -b test
"
queryAcct="Usage: query whether an account is allowed
./slurm -q account
example:
query whether an account named test is blocked
./slurm -q test
"
queryAcctBatch="Usage: query whether a batch of accounts are allowed
./slurm -m account
example:
query whether three account named account1,account2 and account3 are blocked
./slurm -m account1,account2,account3
"
allowUser="Usage: allow a user access to resources
./slurm -j user
example:
allow a user named test to use resources
/slurm -j test
"
blockUser="Usage: block a user
./slurm -f user
example:
block a user named test
./slurm -f test
"
queryUser="Usage: query whether a user is allowed
./slurm -u user
example:
query whether a user named test is blocked
./slurm -u test
"
blockUserfromAcct="Usage: block a user from an account
./slurm -o account user
example:
block a user named test from an account named acct
./slurm -o acct test
"
allowUserfromAcct="Usage: allow a user from an account
./slurm -r account user
example:
allow a user named test from an account named acct
./slurm -r acct test
"
queryUserInAcct="Usage: query whether user is allowed in account
./slurm -s account user
example:
query whether a user named test allowed in an account named acct
./slurm -s acct test
"
AllUserInAcct="Usage: query all users in acct whether they are blocked
./slurm -p account
example:
query all users in account named test whether they are allowed
./slurm -p test
"
AllUserInAllAcct="Usage: query all user in all acct whether they are blocked
./slurm -l all
"
addQuota="Usage: add quota to a user (T)
./gpfs -z userid quota(T)
example:
add 10T quota to user 1906100000:      ./gpfs -z 1906100000 10
"
decreaseQuota="Usage: cut down the quota to a user (T)
./gpfs -w userid quota(T)
example:
cut down 10T quota to user 1906100000:      ./gpfs -w 1906100000 10
"
setQuota="Usage: set quota to a user
./gpfs -x userid quota(T)
example:
set 20T quota to user 1906100000:      ./gpfs -x 1906100000 20
"

queryQuota="Usage: query how many quota the user has
./gpfs -y userid
example:
query how many quota user 1906100000 has:      ./gpfs -y 1906100000
"
changeTimelimit="Usage: add or decrease time to a job (minute)
./slurm -n jobId time(minute)
example:
add 30 minutes to job 4300 : ./slurm -n 4300 30
decrease 30 minutes to job 4300 : ./slurm -n 4300 -30
"
queryJobTime="Usage: query timelimit of a job
./slurm -t jobId
example:
query timelimit of job 4300: ./slurm -t 4300
"

mysql="mysql -uroot -p$MYSQL_PASSWORD"
basePartition=($BASE_PARTITIONS)
allPartition=("compute")
declare -A exclPartition
exclPartition=([compute]="20" )
assoc_table=${CLUSTER_NAME}_assoc_table

addUser() #abandon !!!!!2017-09-24
{
## ./slurm -i 0/1 account username password
## user is on campus:   ./slurm -i 0 schoolID
## user is off campus:  ./slurm -i 1 userId password
    if [[ $# == 3 && $2 == 0 ]] || [[ $# == 4 && $2 == 1 ]] ; then
        username=$3

        user=`sacctmgr -n show user $3`
        if [ "$user" != "" ] ; then
            echo -e "\nUser $4 is already exist!"
            return
        fi
        sacctmgr -i create account name=$3
        for var in ${basePartition[@]}
        do
            sacctmgr -i create user name=$3 partition=$var account=$3
        done
        # if user is off campus, update user_table in mariaDB column Offcampus=1
    else
        echo -e "$addUser\n"
        echo "$nocommand"
    fi
}
addAcct(){
# Usage: add an account to ldap and slurm partition, and specify the owner of the account
# ./slurm -c account 0/1 username password
# example:
# add an account named test, and the owner is campus user Ashlee: ./slurm -c test 0 Ashlee
# add an account named test, and the owner is offCampus user Ashlee: ./slurm -c test 1 Ashlee password
    if [[ $# == 4 && $3 == 0 ]] || [[ $# == 5 && $3 == 1 ]] ; then
        account=$2
        username=$4
        acct=`sacctmgr -n show acct $2`
        user=`sacctmgr -n show user $4`
        if [ "$acct" == "" ] ; then
            sacctmgr -i create account name=$2
            for var in ${basePartition[@]}
            do
                sacctmgr -i create user name=$4 partition=$var account=$2
                sacctmgr -i modify user $4 set qos=normal,high,low DefaultQOS=low
            done
        else
            echo "Account $2 is already exist!"
            exit 6
        fi
    else
        echo -e "$addAcct\n"
        echo "$nocommand"
    fi
}
addToAcct(){
# Usage: add user to an exist account
# ./slurm -g account 0/1 username password
# example:
# add campus user Ashlee to an exist account named test: ./slurm -g test 0 Ashlee
# add offCampus user Ashlee to an exist account named test: ./slurm -g test 1 Ashlee password
    if [[ $# == 4 && $3 == 0 ]] || [[ $# == 5 && $3 == 1 ]] ; then
        username=$4
        acct=`sacctmgr -n show acct $2`
        user=`sacctmgr -n show user $4`
        user_acct=`$mysql --skip-column-names slurm_acct_db -e "select * from $assoc_table where user='$4' and acct='$2' and deleted=0"`
        Is_partition=`sinfo | awk {'print $1'} | sed '1d' | sort -u`
        user2=`ldapsearch -x  uid=$4 | grep homeDirectory`
        if [ "$acct" != "" ] ; then
            if [ "$user" = "" ] || [ "$user2" = "" ]; then # user is not exist
                for var in ${basePartition[@]}
                do
                    sacctmgr -i create user name=$4 partition=$var account=$2
                    sacctmgr -i modify user $4 set qos=normal,high,low DefaultQOS=low
                done
            elif [ "$user_acct" = "" ] ; then # user is not exist in this account
                for var in ${basePartition[@]}
                do
                    sacctmgr -i create user name=$4 partition=$var account=$2
                    sacctmgr -i modify user $4 set qos=normal,high,low DefaultQOS=low
                done
            else
                echo -e "User $4 is already exist in account $2!"
                exit 3
            fi
            if  echo "${Is_partition}" | grep -w "$2" > /dev/null ; then
                sacctmgr -i create user name=$4 partition=$2 account=$2
            fi
            qos_name=`$mysql --skip-column-names slurm_acct_db -e "select name from qos_table where name='$2' and deleted='0'"`
            if [ "$qos_name" != "" ] ; then
                sacctmgr -i modify user where name=$4 account=$2 set qos+=$2 DefaultQOS=low
            fi
        else
            echo "Account $2 is not exist!"
            exit 7
        fi
    else
        echo -e "$addToAcct\n"
        echo "$nocommand"
    fi
}

addShareNode(){
## ./slurm -s  account partition nodenumber
    if [ $# == 4 ] ; then
        account=`$mysql slurm_acct_db -e "select * from acct_table where name='$2' and deleted=0"`
        if [ "$account" = "" ] ; then
            echo "This account $2 is not exist"
            exit 7
        elif  echo "${basePartition[@]}" | grep -w "$3" > /dev/null ; then
            sacctmgr -i add qos $2
            sacctmgr -i modify qos $2 set GrpCPUs=$4
            ## find all users in the account and add these
            result=`$mysql --skip-column-names slurm_acct_db -e "select user from $assoc_table where acct='$2' and deleted=0 and partition='$3'" | sort -u `
            for line in $result
            do
                sacctmgr -i modify user where name=$line account=$2 partition=$3 set qos+=$2 DefaultQOS=low
            done
            allowQos=`scontrol show partition $3 | grep AllowQos= | awk {'print $3'} | awk -F '=' {'print $2'}`
            allowQos=$allowQos",$2"
            scontrol update partition=$3 AllowQos=$allowQos
        else
            echo "Partition $3 is not exist or not allow to add share nodes."
        fi
    else
        echo -e "$addShareNode\n"
        echo "$nocommand"
    fi

}
addExclNode(){
#./slurm -e account partition nodenumber
#example:
#add 5 nodes in Par2 to an account test:    ./slurm -e test Par2 5
    if [ $# == 4 ] ; then
        account=`$mysql slurm_acct_db -e "select * from acct_table where name='$2' and deleted=0"`
        if [ "$account" = "" ] ; then
            echo -e "\nThis account $2 is not exist."
        elif echo "${!exclPartition[@]}" | grep -w "$3" > /dev/null ; then
            if [[ $[`/usr/bin/nodeset -c @$3`-$4] -lt ${exclPartition["$3"]} ]] ; then
                echo -e "\nNodes in this partition is less than expacted after allocated, your request is refused. "
                return
            fi
            newnode=`(/usr/bin/nodeset --pick=$4 -f @$3)`
            last=`/usr/bin/nodeset -f @$3 -x $newnode`
            scontrol create partition=$2 nodes=$newnode
            scontrol update partition=$3 nodes=$last
            sed -i "s/\($3: \).*/\1$last/" /etc/clustershell/groups.d/local.cfg
            echo $2: $newnode >> /etc/clustershell/groups.d/local.cfg

            ## find all users in the account and add these
            result=`$mysql --skip-column-names slurm_acct_db -e "select user from $assoc_table where acct='$2' and deleted=0" | sort -u`
            for line in $result
            do
                sacctmgr -i create user name=$line account=$2 partition=$2
            done
        else
            echo -e "\nPartition $3 is not exist or not allow to add exclusive nodes."
        fi
    else
        echo -e "$addExclNode\n"
        echo "$nocommand"
    fi
}
delUser(){
    ## ./slurm -v userID   delete user and all related account
    ## $1 = -v
    ## $2 = username
    if [ $# == 2 ]; then
        user=`sacctmgr -n show user $2`
        if [ "$user" = "" ] ; then
            echo "User $2 is not exist!"
        else
            sacctmgr -i delete user name=$2
            ## delete ralated null account
            acct=`$mysql --skip-column-names slurm_acct_db -e "select DISTINCT acct from $assoc_table where user='$2' and deleted=0"`
        fi
    else
        echo -e "$delUser\n"
        echo "$nocommand"
    fi

}
delAcct(){ ## attention: ensure this account is not any user's default account
## ./slurm -a account
## example:
## delete an account names test:  ./slurm -a test
    if [ $# == 2 ]; then
        #acct=`$mysql slurm_acct_db -e "select * from acct_table where name='$2' and deleted=0"`
        acct=`sacctmgr -n show acct $2`
        if [ "$acct" == "" ] ; then
            echo "Account $2 is not exist!"
            exit 7
        else
            ## if this acct is running some jobs, then exit
            running=`squeue -o "%.15a %.12u " | grep $acct`
            if [ "$running" != "" ] ; then
                echo "This acct is running some jobs!"
                exit 8
            fi
            user=`$mysql --skip-column-names slurm_acct_db -e "select user from $assoc_table where acct='$2' and deleted=0 " | sort -u`
            for line in $user
            do
                user_acct=`$mysql --skip-column-names slurm_acct_db -e "select acct from $assoc_table where user='$line' and deleted=0" | sort -u | sed "s/^$2$//g"`
                if [ "$user_acct" == "" ] ; then  ## users that only have an account, we should delete these users before delete account
                    /root/HPCSH/slurm -v $line
                else
                    choose=`echo $user_acct | awk {'print $1'}`
             #       echo "choose="$choose
                    #wrong if the default account is not $2 , user's default account shouldn't change
                    defAcct=`$mysql --skip-column-names slurm_acct_db -e "select acct from $assoc_table where user="$line" and deleted=0 and is_def=1" | sort | uniq`
                    if [ "$defAcct" = "$2" ] ; then
                        sacctmgr -i update user set DefaultAccount=$choose where user=$line
                    fi
                fi
            done
            sacctmgr -i delete account name=$2
            ####  if the account has shareNode or ExclusivePartition add this user to the qos or partition
            Is_partition=`sinfo | awk {'print $1'} | sed '1d' | sort -u`
            if  echo "${Is_partition}" | grep -w "$2" > /dev/null ; then
                /root/HPCSH/slurm -n $2
            fi
            qos_name=`$mysql --skip-column-names slurm_acct_db -e "select name from qos_table where name='$2' and deleted='0'"`
            if [ "$qos_name" != "" ] ; then
                sacctmgr -i delete qos $2
                for line in $Is_partition
                do
                     qos=`scontrol show partition $3 | grep AllowQos= | awk {'print $3'} | awk -F '=' {'print $2'} | sed "s/^$2$//g" | sed 's/,,/,/g'`
                     scontrol update partition=$line AllowQos=$qos
                done
            fi

        fi
    else
        echo -e "$delAcct\n"
        echo "$nocommand"
    fi
}
delFromAcct(){   #####2017-08-31   not rewrite it
## ="Usage: delete user from an account
## ./slurm -k account userID1 userID2   delete user from an account
## example:
## delete user user1 and user2 from account named test:  ./slurm -v test user1 user2
    if [ $# -gt 2 ] ; then
        acct=$2
        deleUser=$3
        #account=`$mysql slurm_acct_db -e "select * from acct_table where name='$2' and deleted=0"`
        account=`sacctmgr -n show acct $2`
        if [ "$account" = "" ] ; then
            echo "This account $2 is not exist"
            exit 7
        fi
        user=`$mysql --skip-column-names slurm_acct_db -e "select user from $assoc_table where acct='$2' and deleted=0 " | sort -u`
        shift 2
        while [ $1 ]
        do
            if echo "${user[@]}" | grep -w "$1" > /dev/null ; then
                user_acct=`$mysql --skip-column-names slurm_acct_db -e "select acct from $assoc_table where user='$1' and deleted=0" | sort -u | sed "s/^$acct$//g"`
                if [ "$user_acct" = "" ] ; then ## user only has one account, that's $2=acct
                    echo "here only one account!"
                    /root/HPCSH/slurm -v $1
                else
                    choose=`echo $user_acct | awk {'print $1'}`
                    #wrong if the default account is not $2 , user's default account shouldn't change
                    defAcct=`$mysql --skip-column-names slurm_acct_db -e "select acct from $assoc_table where user="$1" and deleted=0 and is_def=1" | sort | uniq`
                    #echo defAcct=$defAcct
                    if [ "$defAcct" = "$acct" ] ; then
                        sacctmgr -i update user set DefaultAccount=$choose where user=$1
                    fi
                    running=`squeue -o "%.15a %.12u " | grep $1 | grep $acct`
                    if [ "$running" != "" ] ; then
                        echo "This user is running some jobs!"
                        exit 8
                    fi
                    sacctmgr -i delete user name=$1 account=$acct
                   # $mysql slurm_acct_db -e "delete from $assoc_table where user='$1'"
                    qos_name=`$mysql --skip-column-names slurm_acct_db -e "select name from qos_table where name='$acct' and deleted='0'"`
                    if [ "$qos_name" != "" ] ; then
                        sacctmgr -i modify user $1 set qos-=$acct
                    fi
                fi
            else
                echo "User $1 is not exist in account $acct!"
                exit 4
            fi
            shift
        done
    else
        echo -e "$delFromAcct\n"
        echo "$nocommand"
    fi
}
delExclNode(){
#./slurm -n account
#example:
#delete exclusive nodes of account named test, if nodes's within the range of 01-05,set this nodes to partition test1, else set to partition test2
#./slurm -n test
    if [ $# == 2 ] ; then
        account=`sacctmgr -n show acct $2`
        if [ "$account" = "" ] ; then
            echo "This account $2 is not exist"
            exit 7
        fi
        random=`/usr/bin/nodeset --pick=1 -f @$2`
        # ${random:3} gpu01   left 01
        if [ ${random:3} -le 5 ] ; then
            part="test1"
        else
            part="test2"
        fi
        echo $part
        echo $2
        last=`/usr/bin/nodeset -f @$2 @$part`
        scontrol delete partition=$2
        scontrol update partition=$part nodes=$last
        sed -i "s/\($part: \).*/\1$last/" /etc/clustershell/groups.d/local.cfg
        sed -i "/^$2:/d" /etc/clustershell/groups.d/local.cfg
        ## find all users in the account and add these
        result=`$mysql slurm_acct_db -e "select user from $assoc_table where acct='$2' and deleted=0"`
        for line in ${result#*user}
        do
            sacctmgr -i delete user name=$line account=$2 partition=$2
        done
    else
        echo -e "$addExclNode\n"
        echo "$nocommand"
    fi

}
delShareNode(){
#./slurm -t account
#example:
#delete share nodes of account named test  ./slurm -t test
    if [ $# == 3 ] ; then
        qos=`$mysql slurm_acct_db -e "select * from qos_table where name='$2' and deleted=0"`
        if [ "$qos" = "" ] ; then
            echo -e "\nThis qos $2 is not exist!"
        else
            sacctmgr -i delete qos $2
            result=`$mysql --skip-column-names slurm_acct_db -e "select user from $assoc_table where acct='$2' and deleted=0"`
            Is_partition=`sinfo | awk {'print $1'} | sed '1d' | sort -u`
            for line in $Is_partition
            do
                qos=`scontrol show partition $3 | grep AllowQos= | awk {'print $3'} | awk -F '=' {'print $2'} | sed "s/^$2$//g" | sed 's/,,/,/g'`
                scontrol update partition=$3 AllowQos=$qos
            done
        fi
    else
        echo -e "$delShareNode\n"
        echo "$nocommand"
    fi
 }
addAllowAcct(){
#addAllowAcct="Usage: allow an account use resources
#./slurm -d account
#example:
#allow an account named test to use resources
#/slurm -d test
    if [ $# == 2 ] ; then
        acct=`sacctmgr -n show acct $2`
        if [ "$acct" == "" ] ; then
            echo "Account $2 is not exist!"
            exit 7
        fi
        allow=`scontrol show partition compute | grep AllowAccounts | awk '{print $2}' | awk -F "=" '{print $2}'`
        if echo "${allow}" | grep -w "$2" > /dev/null ; then
            echo "Account $2 is already allowed!"
            exit 9
        else
            allowAcct=${allow},$2
            allowAcct=`echo $allowAcct | sed 's/,,/,/g'`
            #echo -e "allowAcct=$allowAcct\n"
            for var in ${basePartition[@]}
            do
                scontrol update partition=$var AllowAccounts=$allowAcct
            done
            # GPU36 parition only can use by cryoem teams
            # scontrol update partition=GPU36 AllowAccounts=hpc1606182266,hpc1706178357,hpc1506177320,hpc0006155389
            sed -i "s/\(AllowAccounts=\).*/\1$allowAcct/"   /etc/slurm/slurm.conf
            echo "Allow account $2 succeed!"
            exit 0
        fi
    else
        echo -e "$addAllowAcct\n"
        echo "$nocommand"
    fi

}

blockAcct(){
#blockAcct="Usage: block an account
#./slurm -b account
#example:
#block an account named test
#./slurm -b test
    if [[ $# == 2 ]] ; then
        acct=`sacctmgr -n show acct $2`
        if [ "$acct" == "" ] ; then
            echo "Account $2 is not exist!"
            exit 7
        fi
        allow=`scontrol show partition compute | grep AllowAccounts | awk '{print $2}' | awk -F "=" '{print $2}'`
        if echo "${allow}" | grep -w "$2" > /dev/null ; then
            allowAcct=`echo $allow | sed "s/$2//g" | sed 's/,,/,/g'`
            for var in ${basePartition[@]}
            do
                scontrol update partition=$var AllowAccounts=$allowAcct
            done
            # GPU36 parition only can use by cryoem teams
            # scontrol update partition=GPU36 AllowAccounts=hpc1606182266,hpc1706178357,hpc1506177320,hpc0006155389
            sed -i "s/\(AllowAccounts=\).*/\1$allowAcct/"   /etc/slurm/slurm.conf
            echo "Block account $2 succeed!"
            exit 0
        else
            echo "Account $2 is already blocked!"
            exit 8
        fi
    else
        echo -e "$blockAcct\n"
        echo $nocommand
    fi

}
blockUser(){
#blockUser="Usage: block a user
#./slurm -f username
#example:
#block a user named test
#./slurm -f test
    if [[ $# == 2 ]] ; then
        user=`sacctmgr -n show user $2`
        if [ "$user" == "" ] ; then
            echo "User $2 is not exist!"
            exit 7
        fi
        qos=`sacctmgr show assoc format=user,qos | grep $2 | uniq | awk '{print $2}'`
        if [ "$qos" == "block" ] ; then
            echo "User $2 is already blocked!"
            exit 8
        else
            sacctmgr -i -Q modify user $2 set qos=block DefaultQOS=block
            echo "User $2 is blocked!"
            exit 0
        fi
    else
        echo -e "$blockUser\n"
        echo $nocommand
    fi

}
blockUserfromAcct(){
# sacctmgr modify user where name=1601214515 account=hpc0006177054  set MaxSubmitJobs=0
#blockUserfromAcct="Usage: block a user from an account
#./slurm -o account user
#example:
#block a user named test from an account named acct
#./slurm -o acct test
    if [[ $# == 3 ]] ; then
        #user=`$mysql --skip-column-names slurm_acct_db -e "select user from $assoc_table where acct='$2' and deleted=0 " | sort -u`
        acct=`sacctmgr -n show acct $2`
        if [ "$acct" == "" ] ; then
            echo "Account $2 is not exist!"
            exit 7
        fi
        user=`sacctmgr -n show user $3`
        if [ "$user" == "" ] ; then
            echo "User $3 is not exist!"
            exit 4
        fi
        exist=`sacctmgr show assoc format=user,acct%20 | grep $2 | awk '{print $1}' | uniq | grep $3`
        if [ "$exist" == "" ] ; then
            echo "User $3 is not exist in account $2"
            exit 4
        else
            sacctmgr -i modify user where name=$3 account=$2 set MaxSubmitJobs=0  MaxJobs=0
            echo "User $3 is blocked in account $2!"
            exit 0
        fi
    else
        echo -e "$blockUserfromAcct\n"
        echo $nocommand
    fi

}

allowUser(){
#allowUser="Usage: allow a user
#./slurm -j username
#example:
#allow a user named test
#./slurm -j test
    if [[ $# == 2 ]] ; then
        user=`sacctmgr -n show user $2`
        if [ "$user" == "" ] ; then
            echo "User $2 is not exist!"
            exit 7
        fi
        qos=`sacctmgr show assoc format=user,qos | grep $2 | uniq | awk '{print $2}'`
        if [ "$qos" == "high,low,normal" ] ; then
            echo "User $2 is already allowed!"
            exit 8
        else
            sacctmgr -i -Q modify user $2 set qos=high,low,normal DefaultQOS=low
            echo "User $2 is allowed!"
            exit 0
        fi
    else
        echo -e "$allowUser\n"
        echo $nocommand
    fi


}
allowUserfromAcct(){
#allowUserfromAcct="Usage: allow a user from an account
#./slurm -r account user
#example:
#allow a user named test from an account named acct
#./slurm -r acct test
    if [[ $# == 3 ]] ; then
        acct=`sacctmgr -n show acct $2`
        if [ "$acct" == "" ] ; then
            echo "Account $2 is not exist!"
            exit 7
        fi
        user=`sacctmgr -n show user $3`
        if [ "$user" == "" ] ; then
            echo "User $3 is not exist!"
            exit 4
        fi
        exist=`sacctmgr show assoc format=user,acct%20 | grep $2 | awk '{print $1}' | uniq | grep $3`
        if [ "$exist" == "" ] ; then
            echo "User $3 is not exist in account $2"
            exit 4
        else
            sacctmgr -i modify user where name=$3 account=$2 set MaxSubmitJobs=-1 MaxJobs=-1
            echo "User $3 is allowed in account $2!"
            exit 0
        fi
    else
        echo -e "$allowUserfromAcct\n"
        echo $nocommand
    fi

}

queryUser(){
#queryUser="Usage: query whether a user is allowed
#./slurm -u user
#example:
#query whether a user named test is blocked
#./slurm -u test
#"
    if [[ $# == 2 ]] ; then
        user=`sacctmgr -n show user $2`
        if [ "$user" == "" ] ; then
            echo "User $2 is not exist!"
            exit 7
        fi
        qos=`sacctmgr show assoc format=user,qos | grep $2 | uniq | awk '{print $2}'`
        if [ "$qos" == "block" ] ; then
            echo "User $2 is blocked!"
            exit 0
        else
            echo "User $2 is allowed!"
            exit 0
        fi
    else
        echo -e "$queryUser\n"
        echo "$nocommand"
    fi
}
queryUserInAcct(){
#queryUserInAcct="Usage: query whether user is allowed in account
#./slurm -s account user
#example:
#query whether a user named test allowed in an account named acct
#./slurm -s acct test
    if [[ $# == 3 ]] ; then
        acct=`sacctmgr -n show acct $2`
        if [ "$acct" == "" ] ; then
            echo "Account $2 is not exist!"
            exit 7
        fi
        user=`sacctmgr -n show user $3`
        if [ "$user" == "" ] ; then
            echo "User $3 is not exist!"
            exit 4
        fi

        exist=`sacctmgr show assoc format=user,acct%20 | grep $2 | awk '{print $1}' | uniq | grep $3`
        if [ "$exist" == "" ] ; then
            echo "User $3 is not exist in account $2"
            exit 4
        else
            MaxSubmitJobs=`$mysql --skip-column-names slurm_acct_db -e " select distinct max_submit_jobs from $assoc_table where acct='$2' and user='$3'"`
            if [ "$MaxSubmitJobs" == "NULL" ] ; then
                echo "User $3 is allowed in account $2!"
                exit 0
            else
                echo "User $3 is blocked in account $2!"
                exit 0
            fi
        fi
    else
        echo -e "$queryUserInAcct\n"
        echo $nocommand
    fi

}

queryDenyAcct(){
#queryAcct="Usage: recharge balance account or refund account
#./slurm -q account1,account2,account3,....
#example:
#query an account named test whether it is blocked
#./slurm -q test
    if [[ $# == 2 ]] ; then
        acct=`sacctmgr -n show acct $2`
        if [ "$acct" == "" ] ; then
            echo "Account $2 is not exist!"
            exit 7
        fi
        allow=`scontrol show partition compute | grep AllowAccounts | awk '{print $2}' | awk -F "=" '{print $2}'`
        if echo "${allow}" | grep -w "$2" > /dev/null ; then
            echo "Account $2 is allowed!"
            exit 0
        else
            echo "Account $2 is blocked!"
            exit 0
        fi
    else
        echo -e "$queryDenyAcct\n"
        echo "$nocommand"
    fi
}

queryAcctBatch(){
## Usage: query whether a batch of accounts are allowed
## ./slurm -m account
## example:
## query three account named account1,account2 and account3 whether they are blocked
## ./slurm -m account1,account2,account3
    if [[ $# == 2 ]] ; then
        str=$2
        str=${str//,/ }
        allow=`scontrol show partition compute | grep AllowAccounts | awk '{print $2}' | awk -F "=" '{print $2}'`
        arr=($str)
        for acct in ${arr[*]}
        do
            exist=`sacctmgr -n show acct $acct`
            if [ "$exist" == "" ] ; then
                echo "Account $acct is not exist!"
                continue
            fi
            if echo "${allow}" | grep -w "$acct" > /dev/null ; then
                echo "Account $acct is allowed!"
            else
                echo "Account $acct is blocked!"
            fi
        done
    else
        echo -e "$queryDenyAcct\n"
        echo "$nocommand"
    fi

}

AllUserInAcct(){
## Usage: query all user in acct whether it is blocked
#./slurm -p account
#example:
#query whether a user named test allowed in an account named acct
#./slurm -p test

    if [[ $# == 2 ]] ; then
        exist=`sacctmgr -n show acct $2`
        if [ "$exist" == "" ] ; then
            echo "Account $2 is not exist!"
            exit 7
        fi
        user_acct=`$mysql --skip-column-names slurm_acct_db -e "select distinct user,qos from $assoc_table where acct='$2' and deleted='0'"`
        if [ "$user_acct" == "" ] ; then
            echo "There is no user in account $2!"
            exit 0
        fi
        acct=$2
        echo $acct
        #result=$acct
        set -- `echo $user_acct`
        while [ $1 ]
        do
            if [ ${1:0:1} == "," ]; then
                shift 1
                continue
            fi
            MaxSubmitJobs=`$mysql --skip-column-names slurm_acct_db -e " select distinct max_submit_jobs from $assoc_table where acct='$acct' and user='$1'"`
            if [ "$MaxSubmitJobs" == "NULL" ] ; then
                echo "$1 : allowd!"
            else
                echo "$1 : blocked!"
            fi
            shift 2
        done
        #echo $result
        #return $result
    else
        echo -e "$AllUserInAcct\n"
        echo "$nocommand"
    fi

}

AllUserInAllAcct(){
## Usage: query all user in acct whether it is blocked
#./slurm -l account
#example:
#query whether a user named test allowed in an account named acct
#./slurm -l test

    if [[ $# == 2 && $2 == "all" ]] ; then
        all_acct=`$mysql --skip-column-names slurm_acct_db -e "select distinct name from acct_table where deleted='0'"`

        for acct in $all_acct
        do
            user_acct=`$mysql --skip-column-names slurm_acct_db -e "select distinct user from $assoc_table where acct='$acct' and deleted='0'"`
            if [ "$user_acct" == "" ] ; then
                echo $acct
                echo "There is no user in account $2!"
                continue
            fi
            if [ "$acct" == "root" ] ; then
                continue
            fi
            echo $acct
            set -- `echo $user_acct`
            while [ $1 ]
            do
                MaxSubmitJobs=`$mysql --skip-column-names slurm_acct_db -e " select distinct max_submit_jobs from $assoc_table where acct='$acct' and user='$1'"`
                if [ "$MaxSubmitJobs" == "NULL" ] ; then
                    echo "$1 : allowed!"
                else
                    echo "$1 : blocked!"
                fi
                shift 1
            done
            echo ""
        done
    else
        echo -e "$AllUserInAllAcct\n"
        echo "$nocommand"
    fi

}
addQuota()
{
# Usage: add quota to a user (T)
# ./gpfs -z userid quota(T)
# example:
# add 10T quota to user 1906100000:      ./gpfs -z 1906100000 10
    if [[ $# == 3 ]] ; then
        exist=`sacctmgr show user $2 | grep $2`
        if [ "$exist" == "" ] ; then
            echo -e "\nUser $2 is not exist!"
            exit 4
        fi
        if [[ $3 =~ ^[0-9]+$ ]] ; then :
        else
            echo -e "\nquota must be a integer!"
            exit 1
        fi
        gid=`id -g $2`
        used=`mmlsquota --block-size auto -g $gid | grep share | awk '{print $4}' `
        quota=`mmlsquota --block-size auto -g $gid | grep share | awk '{print $5}' | awk -F"T" '{print $1}'`
        quota_set=$[$quota+$3]
        quota=$quota"T"
        quota_set=$quota_set"T"
        mmsetquota share --group `id -g $2` --block $quota_set:$quota_set
        echo -e "\nused: $used"
        echo -e "origin quota:$quota"
        echo -e "quota now:$quota_set"
    else
        echo -e "$addQuota\n"
        echo "$nocommand"
    fi

}

decreaseQuota()
{
# Usage: cut down the quota to a user (T)
# ./gpfs -w userid quota(T)
# example:
# cut down 10T quota to user 1906100000:      ./gpfs -w 1906100000 10
    if [[ $# == 3 ]] ; then
        exist=`sacctmgr show user $2 | grep $2`
        if [ "$exist" == "" ] ; then
            echo -e "\nUser $2 is not exist!"
            exit 4
        fi
        if [[ $3 =~ ^[0-9]+$ ]] ; then :
        else
            echo -e "\nquota must be a integer!"
            exit 1
        fi
        gid=`id -g $2`
        used=`mmlsquota --block-size auto -g $gid | grep share | awk '{print $4}' `
        quota=`mmlsquota --block-size auto -g $gid | grep share | awk '{print $5}' | awk -F"T" '{print $1}'`
        quota_set=$[$quota-$3]
        quota=$quota"T"
        quota_set=$quota_set"T"
        mmsetquota share --group `id -g $2` --block $quota_set:$quota_set
        echo -e "\nused: $used"
        echo -e "origin quota:$quota"
        echo -e "quota now:$quota_set"
    else
        echo -e "$decreaseQuota\n"
        echo "$nocommand"
    fi

}
setQuota(){
# Usage: set quota to a user
# ./gpfs -x userid quota(T)
# example:
# set 20T quota to user 1906100000:      ./gpfs -x 1906100000 20
    if [[ $# == 3 ]] ; then
        exist=`sacctmgr show user $2 | grep $2`
        if [ "$exist" == "" ] ; then
            echo -e "\nUser $2 is not exist!"
            exit 4
        fi
        if [[ $3 =~ ^[0-9]+$ ]] ; then :
        else
            echo -e "\nquota must be a integer!"
            exit 1
        fi
        gid=`id -g $2`
        used=`mmlsquota --block-size auto -g $gid | grep share | awk '{print $4}' `
        quota_ori=`mmlsquota --block-size auto -g $gid | grep share | awk '{print $5}' `
        mmsetquota share --group `id -g $2` --block $3"T":$3"T"
        echo -e "\nused: $used"
        echo -e "origin quota:$quota_ori"
        echo -e "quota now:$3"T
    else
        echo -e "$setQuota\n"
        echo "$nocommand"
    fi

}

queryQuota(){
# Usage: query how many quota the user has
# ./gpfs -y userid
# example:
# query how many quota user 1906100000 has:      ./gpfs -y 1906100000
    if [[ $# == 2 ]] ; then
        exist=`sacctmgr show user $2 | grep $2`
        if [ "$exist" == "" ] ; then
            echo -e "\nUser $2 is not exist!"
            exit 4
        fi
        gid=`id -g $2`
        used=`mmlsquota --block-size auto -g $gid | grep share | awk '{print $4}' `
        quota=`mmlsquota --block-size auto -g $gid | grep share | awk '{print $5}' `
        echo -e "\nused: $used"
        echo -e "quota: $quota"
    else
        echo -e "$queryQuota\n"
        echo "$nocommand"
    fi

}
changeTimelimit(){
#./slurm -n jobId time(minute)
#example:
#add 30 minutes to job 4300 : ./slurm -n 4300 30
#decrease 30 minutes to job 4300 : ./slurm -n 4300 -30
    if [ $# == 3 ] ; then
        jobState=`squeue --jobs $2`
        timeToAdd=$3
        if echo "${jobState}" | grep -w "$2" > /dev/null  ; then
            if [ ${timeToAdd:0:1} = "-" ] ; then
                timeToAdd=${timeToAdd:1}
                scontrol update job=$2 TimeLimit-=$timeToAdd
            else
                scontrol update job=$2 TimeLimit+=$timeToAdd
            fi
            echo "Change timelimit suceed."
        else
            echo "Error! Job $2 is not exist"
            exit 7
        fi
    else
        echo -e "$changeTimelimit\n"
        echo "$nocommand"
    fi

}
queryJobTime(){
#./slurm -t jobId
#example:
#query timelimit of job 4300: ./slurm -t 4300
    if [ $# == 2 ] ; then
        jobState=`squeue --jobs $2`
        if echo "${jobState}" | grep -w "$2" > /dev/null  ; then
            jobString=`scontrol show job $2 | grep TimeLimit`
            TimeLimit=${jobString#*TimeLimit=}
            TimeLimit=${TimeLimit% *}
            echo $TimeLimit
        else
            echo "Error! Job $2 is not exist"
            exit 7
        fi
    else
        echo -e "$changeTimelimit\n"
        echo "$nocommand"
    fi

}

case $1 in
    --help | -H | -h)  echo "$usage";;
    --addUser | -I) echo "$addUser";;
    -i)  addUser "$@"; ;;
    --addAcct | -C) echo "$addAcct";;
    -c)  addAcct "$@"; ;;
    #--addShareNode | -S) echo "$addShareNode";;
    #-s) addShareNode "$@"; ;;
    --delFromAcct | -K) echo "$delFromAcct";;
    -k) delFromAcct "$@"; ;;
    --addExclNode | -E) echo "$addExclNode";;
    -e) addExclNode "$@"; ;;
    --delUser | -V) echo "$delUser";;
    -v) delUser "$@"; ;;
    --delAcct | -A) echo "$delAcct";;
    -a) delAcct "$@"; ;;
    --addToAcct | -G) echo "$addToAcct";;
    -g) addToAcct "$@"; ;;
    --addAllowAcct | -D) echo "$addAllowAcct";;
    -d) addAllowAcct "$@"; ;;
    --blockAcct | -B) echo "$blockAcct";;
    -b) blockAcct "$@"; ;;
    --queryDenyAcct | -Q) echo "$queryDenyAcct";;
    -q) queryDenyAcct "$@"; ;;
    --queryAcctBatch | -M) echo "$queryAcctBatch";;
    -m) queryAcctBatch "$@"; ;;
    --allowUser | -J) echo "$allowUser";;
    -j) allowUser "$@"; ;;
    --blockUser | -F) echo "$blockUser";;
    -f) blockUser "$@"; ;;
    --queryUser | -U) echo "$queryUser";;
    -u) queryUser "$@"; ;;
    --blockUserfromAcct | -O) echo "$blockUserfromAcct";;
    -o) blockUserfromAcct "$@"; ;;
    --allowUserfromAcct | -R) echo "$allowUserfromAcct";;
    -r) allowUserfromAcct "$@"; ;;
    --queryUserInAcct | -S) echo "$queryUserInAcct";;
    -s) queryUserInAcct "$@"; ;;
    --AllUserInAcct | -P) echo "$AllUserInAcct";;
    -p) AllUserInAcct  "$@"; ;;
    --AllUserInAllAcct | -L) echo "$AllUserInAllAcct";;
    -l) AllUserInAllAcct  "$@"; ;;
    --addQuota | -Z) echo "$addQuota";;
    -z) addQuota  "$@"; ;;
    --decreaseQuota | -W) echo "$decreaseQuota";;
    -w) decreaseQuota  "$@"; ;;
    --setQuota | -X) echo "$setQuota";;
    -x) setQuota  "$@"; ;;
    --queryQuota | -Y) echo "$queryQuota";;
    -y) queryQuota  "$@"; ;;
    --changeTimelimit | -N) echo "$changeTimelimit";;
    -n) changeTimelimit "$@"; ;;
    --queryJobTime | -T) echo "$queryJobTime";;
    -t) queryJobTime "$@"; ;;
    *) echo -e  "$USE \n"
       echo "$nocommand"
esac

exit 0
