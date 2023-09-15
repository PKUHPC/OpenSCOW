/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

export default {
  common:{
    changeSuccess:"修改成功",
    changeFail:"修改失败",
    email:"邮箱",
    platform:"平台",
    userCount:"用户数量",
    balance:"余额",
    createTime:"创建时间",
    search:"搜索",
    operation:"操作",
    tenant:"租户",
    tenantName:"租户名",
    tenantRole: "用户角色",
    user:"用户",
    userId:"用户ID",
    userName:"用户名",
    import:"导入",
    fresh:"刷新",
    account:"账户",
    accountName:"账户名",
    owner:"拥有者",
    selectTenant:"请选择租户",
    selectAccount:"请选择账户",
    amount:"金额",
    unit:"元",
    comment:"备注",
    submit:"提交",
    time:"时间",
    type:"类型",
    total:"总数",
    sum:"合计",
    ok:"确认",
    prompt:"提示",
    role:"角色",
    add:"添加",
    modify:"修改",
    cancel:"取消",
    cluster:"集群",
    workId:"作业Id",
    minute:"分钟",
    name:"姓名",
    set:"设置",
    clusterWorkId:"集群作业ID",
    partition:"分区",
    workName:"作业名",
    timeSubmit:"提交时间",
    timeEnd:"结束时间",
    more:"更多",
    detail:"详情",
    price:"价格",
    status:"状态",
    changePassword: "修改密码",
    changeEmail: "修改邮箱",
    platformRole: "平台角色",
    illustrate: "说明",
    userInfo: "用户信息",
    loginPassword: "登录密码",
    historyJob: "历史作业",
    tenantInfo: "租户信息",
    admin: "管理员",
    accountCount: "账户数量",
    tenantBalance: "租户余额",
    jobBillingTable: "作业价格表",
    operationLog: "操作日志",
    unfinishedJob: "未结束的作业",
    userList: "用户列表",
    platformInfo: "平台信息",
    platformAdmin: "平台管理员",
    platformFinancialStaff: "平台财务员工",
    tenantCount: "租户数量",
    accountList: "账户列表",
    tenantList: "租户列表",
    addFail: "添加失败",
    addSuccess: "添加成功",
    jobBilling: "作业计费",
    accountOwner: "账户拥有者",
    accountStatus: "账户状态",
    block: "封锁",
    accountBalance: "账户余额",
    normal: "正常",
  },
  dashboard: {
    title: "仪表盘",
    account: {
      title: "账户信息",
      state: "状态",
      balance: "可用余额",
      status: {
        blocked: "封锁",
        normal: "正常",
      },
      alert: "您不属于任何一个账户。",
    },
    job: {
      title: "未结束作业列表",
      extra: "查看所有未结束作业",
      jobTable: {
        cluster: "集群",
        jobId: "作业ID",
        account: "账户",
        name: "作业名",
        partition: "分区",
        qos: "QOS",
        nodes: "节点数",
        cores: "核心数",
        state: "状态",
        time: "运行/排队时间",
        reason: "说明",
        limit: "作业时间限制",
        others: "更多",
      },
      none: "暂无数据",
    },
  },

  footer: "Powered by SCOW",

  runningJob: {
    title: "本用户未结束的作业",
  },
  layouts: {
    route: {
      common:{
        operationLog:"操作日志",
      },
      navLinkText: "门户",
      dashboard: "仪表盘",
      user: {
        firstNav: "用户空间",
        runningJobs: "未结束的作业",
        finishedJobs: "已结束的作业",
        clusterPartitions: "集群和分区信息",
      },
      platformManagement: {
        fistNav: "平台管理",
        info: "平台信息",
        importUsers: "导入用户",
        tenantsManagement:"租户管理",
        tenantsList: "租户列表",
        createTenant: "创建租户",
        usersList: "用户列表",
        jobBillingTable: "作业价格表",
        financeManagement: "财务管理",
        tenantPay: "租户充值",
        payments: "充值记录",
        systemDebug: "平台调试",
        statusSynchronization: "封锁状态同步",
        jobSynchronization: "作业信息同步",
        accountList: "账户列表",
      },
      tenantManagement: {
        firstNav: "租户管理",
        info: "租户信息",
        manageJobPrice: "作业价格表",
        runningJobs: "未结束的作业",
        finishedJobs: "已结束的作业",
        userManagement: "用户管理",
        userList: "用户列表",
        createUser: "创建用户",
        jobTimeLimit: "调整作业时间限制",
        storage: "调整用户存储空间",
        accountManagement: "账户管理",
        accountList: "账户列表",
        createAccount: "创建账户",
        whitelist: "账户白名单",
        financeManagement: "财务管理",
        accountPay: "账户充值",
        financePayments: "充值记录",
        accountPayments: "账户充值记录",
      },
      accountManagement: {
        firstNav:"账户管理",
        info: "账户信息",
        runningJobs: "未结束的作业",
        finishedJobs: "已结束的作业",
        userManagement: "用户管理",
        pay: "充值记录",
        cost: "消费记录",
      },
    },
  },
  pageComp:{
    accounts:{
      accountTable:{
        allAccount:"所有账户",
        debtAccount:"欠费账户",
        blockedAccount: "封锁账户",
        account:"账户",
        accountName:"账户名",
        owner:"拥有者",
        tenant:"租户",
        comment:"备注",
        status:"状态",
        mangerMember:"管理成员",
        block:"封锁",
        normal:"正常",
        unit:" 元",
      },
    },
    admin:{
      allTenantsTable:{
        tenantName:"租户名",
        accountCount:"账户数量",
      },
      allUserTable:{
        allUsers:"所有用户",
        platformAdmin:"平台管理员",
        platformFinance:"财务人员",
        idOrName:"用户ID或者姓名",
        userId:"用户ID",
        name:"姓名",
        tenant:"所属租户",
        availableAccounts:"可用账户",
        roles:"平台角色",
        notExist:"用户不存在",
        notAvailable:"本功能在当前配置下不可用",
        success:"本功能在当前配置下不可用",
        fail:"本功能在当前配置下不可用",
        changePassword:"修改密码",
      },
      createTenantForm:{
        prompt:"请输入租户名并为其创建一个新用户作为该租户的管理员",
        adminInfo:"管理员信息",
        userEmail:"用户邮箱",
        userPassword:"用户密码",
        confirmPassword:"确认密码",
      },
      ImportUsersTable:{
        selectAccount:"请选择账户！",
        specifyOwner:"请为每个账户指定拥有者",
        incorrectFormat:"数据格式不正确",
        importSuccess:"导入成功",
        selectCluster:"选择集群，以账户为单位导入到默认租户中",
        alreadyExist:"账户已经存在于SCOW中",
        notExist:"账户不存在于SCOW中，将会导入SCOW",
        partNotExist:"账户中部分用户不存在于SCOW中，将会导入新的用户",
        selectOwner:"请选择一个拥有者",
        importStatus:"导入状态",
        alreadyImport:"已导入",
        partImport:"账户已导入，部分用户未导入",
        notImport:"未导入",
        userList:"用户列表",
        addWhitelist:"将所有账户加入白名单",
      },
      tenantChargeForm:{
        loadType:"正在加载使用过的类型……",
        charging:"充值中……",
        accountNotFound:"账户未找到",
        chargeFinish:"充值完成！",
      },
    },
    commonComponent:{
      paymentTable:{
        total:"总数",
        sum:"合计",
        paymentDate:"交费日期",
        paymentAmount:"交费日期",
        ipAddress:"IP地址",
        operatorId:"操作者Id",
      },
    },
    dashboard:{
      storageCard:{
        storage:"存储",
        alreadyUsed:"已使用",
        totalLimited:"总限额",
        nowUsed:"获取当前使用量",
      },
      storageSection:{
        storageStatus:"存储状态",
      },
    },
    finance:{
      AccountSelector:{
        freshList:"刷新账户列表",
      },
      chargeForm:{
        loadType:"正在加载使用过的类型……",
        charging:"充值中……",
        notFound:"账户未找到",
        chargeFinished:"充值完成！",
      },
      chargeTable:{
        time:"扣费日期",
        amount:"扣费金额",
      },
    },
    init:{
      initAdminForm:{
        alreadyExist:"用户已存在",
        cannotAdd:"用户已存在于SCOW数据库，无法再添加此用户",
        notExist:"用户不存在于认证系统",
        confirm:"用户不存在，请确认用户ID是否正确",
        existText:"用户已经在认证系统中存在，您此处输入的密码将会不起作用，新用户的密码将是认证系统中的已有用户的当前密码。确认添加为初始管理员？",


        notExistText:"用户不存在于认证系统，是否确认创建此用户并添加为初始管理员？",

        cannotConfirmText1:"无法确认用户是否在认证系统中存在， 将会尝试在认证系统中创建。如果用户已经在认证系统中存在，您此处输入的密码将会不起作用，新用户的密码将是认证系统中的已有用户的当前密码",



        cannotConfirmText2:`无法确认用户是否在认证系统中存在，并且当前认证系统不支持创建用户，请您确认此用户已经在认证系统中存在，
                            确认将会直接加入到数据库中, 并且您此处输入的密码将不会起作用，新用户的密码将是认证系统中的已有用户的当前密码。`,



        addFail:"添加失败",
        userExist:"此用户存在于scow数据库",
        addSuccess:"添加成功",
        addDb:"此用户存在于认证系统中，已成功添加到SCOW数据库",
        addFinish:"添加完成！",
        createFail:"创建用户失败",
        initAdmin:"您可以在此创建初始管理员用户。",
        addAdmin:"这里添加的用户为初始管理员，位于默认租户中，将会自动拥有",

        platFormAdmin:"平台管理员",
        and:"和",
        defaultTenant:"默认租户的租户管理员",
        createText1:"当前认证系统支持创建用户，您可以选择加入一个已存在于认证系统的用户，或者创建一个全新的用户。系统将会在认证系统中创建此用户",


        createText2:"当前认证系统不支持创建用户，请确认要添加的用户必须已经存在于认证系统，且用户的ID必须和认证系统中的用户ID保持一致",


      },
      initImportUsersTable:{
        importUser:"您可以在此导入已有用户。 查看",
        document:"此文档",
        learn:"了解系统用户模型以及如何导入用户信息。",
        useMore:"如果您使用SCOW管理多个集群，SCOW系统要求多个集群具有完全相同的用户账户信息，您只需要从一个集群中导入已有用户信息即可。",


      },
      initJobBillingTable:{
        set:"您可以在这里设置默认作业价格表。您必须全部设置完全部价格才能完成初始化。",

      },
      initLayout:{
        importUser:"导入用户",
        userManager:"用户账户管理",
        create:"创建初始管理员用户",
        edit:"编辑作业价格表",
        Incomplete:"价格表不完整",
        set:"请对每个作业计费项确定价格后再完成初始化。",
        confirm:"确认完成初始化",
        confirmText:"一旦完成初始化，您将无法进入此页面重新初始化。",
        finish:"初始化完成！",
        goLogin:"点击确认前往登录",
        init:"系统初始化",
        complete:"完成初始化",
      },
      initUsersAndAccountsTable:{
        platformRole:"平台角色",
        tenantRole:"租户角色",
        accountAffiliation:"所属账户",
        defaultTenant:"您可以在这里管理当前系统中默认租户下的用户和账户，以及设置某个用户为",

        initAdmin:"初始管理员",
        set:"指同时为租户管理员和平台管理员的用户。",
      },
    },
    job:{
      ChangeJobTimeLimitModal:{
        modifyLimit:"修改作业时限",
        success:"修改时限全部成功完成。",
        fail:"部分作业修改时限失败。",
        setLimit:"设置作业时限",
        modifyWork:"修改失败的作业",
      },
      editableJobBillingTable:{
        alreadyUsed:"此Id已经被使用",
        addSuccess:"添加成功！",
        edit:"编辑作业价格项",
        defaultPrice:"默认价格项",
        path:"计费路径",
        id:"计费项Id",
        strategy:"计费策略",
        price:"价格(元)",
        name:"分区全名",
        nodes:"分区节点数",
        cores:"单节点核心数",
        gpus:"单节点GPU数",
        memory:"单节点内存（MB）",
        now:"当前计费项",
        unset:"未设置",
      },
      historyJobDrawer:{
        list:"使用节点列表",
        timeSubmit:"提交时间",
        timeStart:"开始时间",
        timeEnd:"结束时间",
        gpus:"使用GPU数(个)",
        cpusReq:"申请CPU数(个)",
        cpusAlloc:"分配CPU数(个)",
        memReq:"申请的内存(MB)",
        memAlloc:"分配的内存(MB)",
        nodesReq:"申请节点数(个)",
        nodesAlloc:"分配节点数(个)",
        timeLimit:"作业时间限制(分钟)",
        timeUsed:"作业执行时间(秒)",
        timeWait:"作业等待时间(秒)",
        recordTime:"记录时间",
        workFee:"作业计费(元)",
        tenantFee:"租户计费(元)",
        platformFee:"平台计费",
        detail:"作业详细信息",
      },
      historyJobTable:{
        noAuth:"您没有权限查看此信息。",
        batchSearch:"批量搜索",
        jobEndTime:"作业结束时间",
        precision:"精确搜索",
        platformPrice:"平台计费",
        tenantPrice:"租户计费",
        jobNumber:"作业数量",
      },
      jobBillingManagementTable:{
        priceId:"计费项ID",
        path:"计费路径",
        tenant:"所属租户",
      },
      manageJobBillingTable:{
        itemId:"计费价格编号",
        price:"单价（元）",
        abandon:"已作废",
        notExpanded:"收起历史计费项",
        expanded:"展开历史计费项",
        priceItem:"计费项",
        text:"集群, 分区, QOS共同组成一个计费项。对计费项可以设定计费方式和单价",

        executing:"执行中",
        unset:"未设置",
        alreadyUsed:"此ID已经被使用！",
        addSuccess:"添加成功！",
        setPrice:"设置计费价格",
        object:"对象",
        newItemId:"新计费价格编号",
      },
      runningJobDrawer:{
        nodes:"节点数（个）",
        cores:"核心数（个）",
        gpus:"GPU卡数（个）",
        nodesOrReason:"说明",
        runningOrQueueTime:"运行/排队时间",
        timeLimit:"作业时限（分钟）",
        detail:"未结束的作业详细信息",
      },
      runningJobTable:{
        extendLimit: "延长所选作业时间限制",
        batch: "批量搜索",
        precision: "精确搜索",
        nodes: "节点数",
        cores: "核心数",
        time: "运行/排队时间",
        reason: "说明",
        limit: "作业时间限制",
        changeLimit: "修改作业时限",
        gpus: "GPU卡数",
      },
    },
    profile:{
      changeEmailFail:"修改邮箱失败",
      changeEmailSuccess:"邮箱更改成功！",
      changeEmail:"修改邮箱",
      oldEmail:"原邮箱",
      newEmail:"新邮箱",
      inputEmail:"请输入新邮箱",
      changePasswordSuccess:"密码更改成功！",
      oldPasswordWrong:"原密码错误！",
      changePassword:"修改密码",
      oldPassword:"原密码",
      newPassword:"新密码",
      confirmPassword:"确认密码",
    },
    tenant:{
      accountWhitelistTable:{
        whiteList:"白名单数量",
        debtSum:"白名单欠费合计",
        joinTime:"加入时间",
        operatorId:"操作人",
        confirmRemoveWhite:"确认将账户移除白名单？",
        confirmRemoveWhiteText1:"确认要将账户",
        confirmRemoveWhiteText2:"从白名单移除？",
        removeWhiteSuccess:"移出白名单成功！",
        removeWhite:"从白名单中去除",
      },
      addWhitelistedAccountButton:{
        notExist:"账户不存在！",
        addSuccess:"添加成功！",
        addWhiteList:"添加白名单账户",
      },
      adminJobTable:{
        batch:"批量搜索",
        precise:"精确搜索",
        adjust:"调整搜索结果所有作业",
        tenantPrice:"租户计费",
        platformPrice:"平台计费",
        jobNumber:"作业数量：",
        tenantPriceSum:"租户计费合计：",
        platformPriceSum:"平台计费合计：",
      },
      adminUserTable:{
        allUsers:"所有用户",
        tenantAdmin:"租户管理员",
        tenantFinance:"财务人员",
        idOrName:"用户ID或者姓名",
        tenantRole:"租户角色",
        affiliatedAccountName:"可用账户",
        notExist:"用户不存在",
        notAvailable:"本功能在当前配置下不可用",
        changeSuccess:"修改成功",
        changeFail:"修改失败",
        changePassword:"修改密码",
      },
      jobPriceChangeModal:{
        tenantPrice:"租户计费",
        platformPrice:"平台计费",
        changeJob:"修改作业",
        jobNumber:"作业数量",
        newJob:"新作业",
        reason:"修改原因",
      },
      tenantSelector:{
        fresh:"刷新租户列表",
      },
    },
    user:{
      addUserButton:{
        addUser:"添加用户",
        notMatch:"您输入的用户ID和姓名不匹配。",
        alreadyBelonged:"已属于其他租户",
        notExist:"租户或账户不存在",
        will:"将在",
        createModal:"秒后打开创建用户界面",
        createFirst:"用户不存在。请先创建用户",
        addSuccess:"添加成功！",
      },
      createUserForm:{
        email:"用户邮箱",
        password:"用户密码",
        confirm:"确认密码",
      },
      createUserModal:{
        alreadyExist:"此用户ID已经存在！",
        createUser:"创建用户",
        notExist:"用户不存在，请输入新用户信息以创建用户并添加进账户",

        email:"用户邮箱",
        password:"用户密码",
        confirm:"确认密码",
      },
      jobChargeLimitModal:{
        setSuccess:"设置成功",
        priceLimited:"用户作业费用限额",
        alreadyUsed:"当前已使用/总限额",
        cancelPriceLimited:"取消作业费用限额",
        confirmCancelLimited:"确认要取消此用户在此账户中的限额吗？",
        cancelAndNotBlock:"取消限额的同时解除封锁",
        cancelSuccess:"取消成功！",
        cancelLimited:"取消限额",
        unset:"未设置",
        changeLimited:"修改限额至",
        setLimited:"设置限额",
      },
      userTable:{
        block:"封锁",
        normal:"正常",
        admin:"管理员",
        user:"普通用户",
        role:"角色",
        alreadyUsed:"已用额度/用户限额",
        none:"无",
        limitManage:"限额管理",
        confirmNotBlock:"确认解除用户封锁？",
        confirmUnsealText1:"确认要从账户",
        confirmUnsealText2:"解除用户",
        confirmUnsealText3:"）的封锁？",
        unsealSuccess:"解封用户成功！",
        unseal:"解除封锁",
        confirmBlock:"确认封锁用户？",
        confirmBlockText1:"确认要从账户",
        confirmBlockText2:"封锁用户",
        blockSuccess:"封锁用户成功！",
        confirmCancelAdmin:"确认取消管理员权限",
        confirmCancelAdminText1:"确认取消用户",
        confirmCancelAdminText2:"在账户",
        confirmCancelAdminText3:"的管理员权限吗？",
        operateSuccess:"操作成功！",
        cancelAdmin:"取消管理员权限",
        confirmGrantAdmin:"给予管理员权限",
        confirmGrantAdminText1:"确认给予用户",
        confirmGrantAdminText2:"在账户",
        grantAdmin:"设为管理员",
        cannotRemove:"不能移出账户拥有者",
        confirmRemove:"确认移出用户",
        confirmRemoveText:"确认要从账户",
        removeSuccess:"移出用户成功！",
        removerUser:"移出用户",
      },
    },
  },
  component:{
    errorPages:{
      notAllowedPage:"不允许访问此页面",
      systemNotAllowed:"系统不允许您访问此页面。",
      notAllowed:"不允许访问",
      needLogin:"需要登录",
      notLogin:"您未登录或者登录状态已经过期。您需要登录才能访问此页面。",
      login:"登录",
      notExist:"不存在",
      pageNotExist:"您所请求的页面不存在。",
      serverWrong:"服务器出错",
      sorry:"对不起，服务器出错。请刷新重试。",
    },
    others:{
      seeDetails:"细节请查阅文档",
      modifyUser:"修改用户",
      password:"的密码",
      inputNewPassword:"请输入新密码",
      newPassword:"新密码",
      confirmPassword:"确认密码",
      selectCluster:"请选择集群",
      nodes:"分区节点数",
      cores:"单节点核心数",
      gpus:"单节点GPU数",
      mem:"单节点内存（MB）",
      price:"单价（元）",
      notDefined:"未定义",
      description:"说明",
      operationType:"操作行为",
      operationResult:"操作结果",
      operatorUserId:"操作员",
      operationTime:"操作时间",
      operationCode:"操作码",
      operationDetail:"操作内容",
      operatorIp:"操作IP",
      alreadyIs:"用户已经是该角色",
      notExist:"用户不存在",
      notAuth:"用户没有权限",
      setSuccess:"设置成功",
      cannotCancel:"不能取消自己的平台管理员角色",
      alreadyNot:"用户已经不是该角色",
      selectRole:"选择角色",
    },
  },
  page: {
    noAccount: {
      resultTitle: "没有可以管理的账户",
    },
    _app: {
      clusterOpErrorTitle: "操作失败",
      clusterOpErrorContent: "多集群操作出现错误，部分集群未同步修改",

      effectErrorMessage: "服务器出错啦！",
    },
    profile: {
      index: {
        accountInfo: "账号信息",
      },
    },
    user: {
      partitions: {
        getBillingTableErrorMessage: "集群和分区信息获取失败，请联系管理员。",

        partitionInfo: "分区信息",
      },
      operationLogs: {
        userOperationLog: "本用户操作日志",
      },
      historyJobs: {
        userCompletedJob: "本用户已结束的作业",
      },
    },
    tenant: {
      info: {
        tenantFinanceOfficer: "租户财务人员",
      },
      jobBillingTable: {
        manageTenantJobPriceTable: "管理本租户作业价格表",
      },
      storage: {
        increase: "增加",
        decrease: "减少",
        set: "设置为",
        userNotFound: "用户未找到",
        balanceChangeIllegal: "余额变化不合法",
        editSuccess: "修改成功！",
        inputUserIdAndCluster: "请输入用户ID和集群",
        currentSpace: "当前空间",
        searching: "查询中...",
        clickSearch: "请点击查询",
        storageChange: "存储变化",
        selectSetTo: "选择设置为",
        adjustUserStorageSpace: "调整用户存储空间",
      },
      users: {
        list: {
          title: "用户列表",
        },
        create: {
          userExist: "用户已存在",
          userExistMessage: "用户已存在于SCOW数据库，无法再添加此用户",
          userExistAuth: "用户已存在于认证系统",
          userNotExistAuth: "用户未存在于认证系统",
          unableDetermineUserExistAuth: "无法确定用户是否存在于认证系统",
          userExistAuthMessage: "用户已经在认证系统中存在，您此处输入的密码将会不起作用，新用户的密码将是认证系统中的已有用户的当前密码。点击“确认”将会将此用户直接添加到SCOW数据库。",



          userNotExistAuthMessage: "点击“确认”将会同时在SCOW数据库和认证系统创建此用户",

          userExistInSCOWDatabaseMessage: "此用户存在于scow数据库",
          userExistAndAddToSCOWDatabaseMessage: "此用户存在于认证系统中，已成功添加到SCOW数据库",

          createUserFail: "创建用户失败",
          addCompleted: "添加完成！",
          crateUser: "创建用户",
        },
      },
      finance: {
        payments: {
          title: "充值记录",
        },
        payAccount: {
          title: "账户充值",
        },
        accountPayments: {
          title: "账户充值记录",
        },
      },
      accounts: {
        whitelist: {
          title: "白名单账户",
          whitelistAccountList: "白名单账户列表",
        },
        list: {
          title: "账户列表",
        },
        create: {
          tenantNotExistUser: "租户 {} 下不存在用户 {}。",
          accountNameOccupied: "账户名已经被占用",
          userIdAndNameNotMatch: "用户ID和名字不匹配。",
          createSuccess: "创建成功！",
          ownerUserId: "拥有者用户ID",
          ownerName: "拥有着姓名",
          remark: "备注",
          createAccount: "创建账户",
        },
        accountName: {
          users: {
            userId: {
              jobs: {
                userExecJobList: "{}在{}中执行过的作业列表",
              },
            },
            index: {
              cannotManageUser: "您不能管理账户{}的用户。",
              userInAccount: "账户{}的用户",
            },
          },
        },
      },
    },
    init: {
      systemInitialized: "系统已初始化",
      unableReinitialize: "系统已经初始化完成，无法重新初始化！",
    },
    admin: {
      operationLogs: {
        platformOperationLog: "平台操作日志",
      },
      jobBilling: {
        jobBillingPriceTable: "作业计费价格表",
      },
      importUsers: {
        importUserInfo: "导入用户信息",
      },
      tenants: {
        create: {
          adminExist: "管理员用户已存在",
          adminExistMessage: "管理员用户已存在于SCOW数据库，无法再添加此用户",
          adminNotExistAuth: "管理员用户不存在于认证系统",
          adminNotExistAuthMessage: "管理员用户不存在，请确认管理员用户ID是否正确",
          adminExistAuthMessage: "管理员用户已经在认证系统中存在，您此处输入的密码将会不起作用，新用户的密码将是认证系统中的已有用户的当前密码。确认添加为新建租户管理员？",


          adminNotExistAuthAndConfirmCreateMessage: "管理员用户不存在于认证系统，是否确认创建此用户并添加为新建租户管理员？",

          unableConfirmAdminExistInAuthMessage: "无法确认管理员用户是否在认证系统中存在，将会尝试在认证系统中创建。"
          + "如果用户已经在认证系统中存在，您此处输入的密码将会不起作用，新用户的密码将是认证系统中的已有用户的当前密码",



          unableConfirmAdminExistInAuthAndUnableCreateMessage: "无法确认管理员用户是否在认证系统中存在，并且当前认证系统不支持创建用户，"
          + "请您确认此用户已经在认证系统中存在，确认将会直接加入到数据库中, 并且您此处输入的密码将不会起作用，新用户的密码将是认证系统中的已有用户的当前密码。",



          existInSCOWDatabase: "此{}已存在于scow数据库",
          createTenantSuccessMessage: "租户创建成功，且管理员用户存在于认证系统中，已成功添加到SCOW数据库",

          addCompleted: "添加完成！",
          createTenantFailMessage: "创建租户失败",
          createTenant: "创建租户",
        },
      },
      systemDebug: {
        slurmBlockStatus: {
          syncUserAccountBlockingStatus: "用户账户封锁状态同步",
          alertInfo: "在调度器重新启动后，集群与SCOW中用户的封锁状态可能出现不同步的情况，您可以点击刷新调度器用户封锁状态，手动刷新同步所有用户状态。",


          slurmScheduler: "slurm调度器",
          slurmSchedulerMessage1: "如果您使用的是slurm调度器，由于技术限制，当您运行slurm.sh节点和slurm管理节点并非同一节点时，" +
          "已封锁的用户、账户和用户账户将会在slurm集群重启后被解封。",

          slurmSchedulerMessage2: "SCOW在启动时将会自动刷新一次slurm封锁状态，但是slurm集群可能在SCOW运行时重启，SCOW暂时不能对这种情况做出反应。",


          slurmSchedulerMessage3: "所以，如果您运行slurm.sh节点和slurm管理节点并非同一节点时，您需要在slurm集群重启后手动执行一下本页面的刷新调度器用户封锁状态的功能。" +
          "如果slurm.sh节点和slurm管理节点为同一节点，您可以忽略本功能。",


          otherScheduler: "其他调度器",
          otherSchedulerMessage: "如果您使用的是slurm之外的调度器，在调度器和SCOW间用户封锁状态不同步时，可以手动执行一下本页面的刷新调度器用户封锁状态的功能。",


          lastRunTime: "上次运行时间",
          notBlocked: "未封锁过",
          refreshSuccess: "刷新成功",
          refreshSchedulerUserBlockingStatus: "刷新调度器用户封锁状态",
        },
        fetchJobs: {
          jobInfoSync: "作业信息同步",
          alertMessage: "SCOW会定时从集群同步作业信息，您可以点击立刻同步执行一次手动同步。",

          periodicSyncJobInfo: "周期性同步作业信息",
          turnedOn: "已开启",
          paused: "已暂停",
          stopSync: "停止同步",
          startSync: "开始同步",
          jobSyncCycle: "作业同步周期",
          lastSyncTime: "上次同步时间",
          notSynced: "未同步过",
          jobSyncSuccessMessage: "作业同步完成，同步到{}条新纪录。",
          syncJobNow: "立刻同步作业",
        },
      },
      finance: {
        pay: {
          tenantCharge: "租户充值",
        },
        payments: {
          chargeRecord: "充值记录",
        },
      },
    },
    accounts: {
      accountName: {
        users: {
          title: "账户{}用户管理",
        },
        userJob: {
          title: "用户{}在账户{}下运行的作业",
        },
        runningJobs: {
          title: "账户{}未结束的作业",
        },
        payments: {
          title: "账户{}充值记录",
        },
        operationLog: {
          title: "账户{}操作日志",
        },
        historyJobs: {
          title: "账户{}已结束的作业",
        },
        charges: {
          title: "账户{}扣费记录",
        },
      },
    },
  },
};
