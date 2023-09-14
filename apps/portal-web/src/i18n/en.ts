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
  baseLayout: {
    linkText: "管理系统",
  },
  // routes
  routes: {
    dashboard: "Dashboard",
    job:{
      title: "AAA作业",
      runningJobs: "未结束的作业",
      allJobs: "所有作业",
      submitJob: "提交作业",
      jobTemplates: "作业模板",
    },
    desktop: "Desktop",
    apps: {
      title: "交互式应用",
      appSessions: "已创建的应用",
      createApp: "创建应用",
    },
    file: "文件管理",
  },
  // button
  button: {
    searchButton: "搜索",
    refreshButton: "刷新",
    cancelButton: "取消",
    confirmButton: "确定",
    selectButton: "选择",
    actionButton: "操作",
    deleteButton: "删除",
    renameButton: "重命名",
    finishButton: "结束",
    detailButton: "详情",
    submitButton: "提交",
  },
  // pageComp
  pageComp: {
    profile: {
      changPasswordModal: {
        successMessage: "密码更改成功!",
        errorMessage: "原密码错误!",
        changePassword: "AAA修改密码",
        oldPassword:"原密码",
        newPassword: "新密码",
        confirm: "确认密码",
      },
    },
    // job
    job: {
      accountSelector: {
        selectAccountPlaceholder: "AAA请选择账户",
        refreshAccountList: "刷新账户列表",
      },
      allJobsTable: {
        searchForm: {
          clusterLable: "AAA集群",
          time: "时间",
          popoverTitle: "查询该时间区域内所有有活动（如作业提交、等待中、开始、运行、失败、完成）的作业",
          jobId: "作业ID",
        },
        tableInfo: {
          jobId: "AA作业ID",
          jobName: "作业名",
          account: "账户",
          partition: "分区",
          qos: "QOS",
          state: "状态",
          submitTime: "提交时间",
          startTime: "开始时间",
          endTime: "结束时间",
          elapsed: "运行时间",
          timeLimit: "作业时间限制",
          reason: "说明",
          more: "更多",
          linkToPath: "进入目录",
        },
      },
      // fileSelectModal
      fileSelectModal: {
        title: "文件目录选择框",
        newPath: "新目录AA",
      },
      // jobTemplateModal
      jobTemplateModal: {
        clusterLabel:"AAA集群",
        errorMessage: "模板不存在!",
        changeSuccessMessage: "修改成功!",
        changTemplateName: "修改模板名字",
        newTemplateName: "新模板名",
        templateName: "模板名",
        comment: "备注",
        useTemplate:"使用模板",
        popConfirm: "确定删除这个模板吗?",
        deleteSuccessMessage: "模板已删除!",
      },
      // runningJobDrawer
      runningJobDrawer: {
        cluster: "集群",
        jobId: "作业ID",
        account: "账户",
        jobName: "作业名",
        partition: "分区",
        qos: "QOS",
        nodes: "节点数（个）",
        cores: "核心数（个）",
        gpus: "GPU卡数（个）",
        state: "状态",
        nodesOrReason: "说明",
        runningOrQueueTime: "运行/排队时间",
        submissionTime: "提交时间",
        timeLimit: "作业时限（分钟）",
        drawerTitle: "AAA未结束的作业详细信息",
      },
      // runningJobTable
      runningJobTable: {
        filterForm: {
          cluster: "AA集群",
          jobId: "作业ID",
        },
        jobInfoTable: {
          cluster: "集群",
          jobId: "作业ID",
          user: "用户",
          account: "账户",
          name: "作业名",
          partition: "分区",
          qos: "QOS",
          nodes: "节点数",
          cores: "核心数",
          gpus: "卡数",
          state: "状态",
          runningOrQueueTime: "运行/排队时间",
          nodesOrReason: "说明",
          timeLimit: "作业时间限制",
          more: "更多",
          linkToPath: "进入目录",
          popConfirm: "确定结束这个任务吗?",
          successMessage: "任务结束请求已经提交!",
        },
      },
      // submitJobForm
      submitJobForm: {
        errorMessage: "提交作业失败",
        successMessage: "提交成功！您的新作业ID为：",
        cluster: "AA集群",
        jobName: "作业名",
        command: "命令",
        account: "账户",
        partition: "分区",
        qos: "QOS",
        nodeCount: "节点数",
        gpuCount: "单节点GPU卡数",
        coreCount: "单节点核心数",
        maxTime: "最长运行时间",
        minute: "分钟",
        workingDirectory: "工作目录",
        wdTootip1: "1. 请填写绝对路径，如填写相对路径，则相对于该用户家目录；",
        wdTootip2: "2. 填写目录不可访问或者不可操作时，提交作业或者作业运行将失败；",
        output: "标准输出文件",
        errorOutput: "错误输出文件",
        totalNodeCount: "总节点数：",
        totalGpuCount: "总GPU卡数：",
        totalCoreCount: "总CPU核心数：",
        totalMemory: "总内存容量：",
        comment: "备注",
        saveToTemplate: "保存为模板",
      },

    },

  },
  pages: {
    apps: {
      create: {
        title: "create ",
        error404: "This app is not found",
      },
      createApps: {
        subTitle: "您所请求的集群不存在",
        title: "创建应用",
        pageTitle: "在{}集群创建应用",
      },
      sessions: {
        subTitle: "您所请求的集群不存在",
        title: "交互式应用",
        pageTitle: "集群{}交互式应用",
      },
    },
    desktop: {
      title: "桌面",
      pageTitle: "登录节点上的桌面",
    },
    files: {
      path: {
        subTitle: "您所请求的集群不存在",
        title: "文件管理",
      },
    },
    jobs: {
      allJobs: {
        title: "历史作业",
        pageTitle: "本用户所有历史作业",
      },
      runningJobs: {
        title: "未结束的作业",
        pageTitle: "本用户未结束的作业",
      },
      savedJobs: {
        title: "作业模板",
        pageTitle: "作业模板列表",
      },
      submit: {
        title: "作业模板",
        pageTitle: "作业模板列表",
        spin: "正在加载作业模板",
      },
    },
    profile: {
      title: "账号信息",
      userInfo: "用户信息",
      identityId: "用户ID",
      name: "用户姓名",
      changePassword: "修改密码",
      loginPassword: "登录密码",
    },
    shell: {
      loginNode: {
        title: "的终端",
        content: "以ID: {} 连接到集群 {} 的 {} 节点",
        reloadButton: "刷新并重新连接",
        popoverTitle: "命令",
        popoverContent1: "跳转到文件系统",
        popoverContent2: "，输入该命令后会跳转到文件系统，您可以进行文件的上传和下载",
        popoverContent3: "文件下载",
        popoverContentFile:"文件名",
        popoverContent4: "，输入",
        popoverContent5: "，您当前路径下的该文件会被下载到本地，目前不支持输入相对路径，",
        popoverContent6: "如果需要下载其他目录下的文件请使用",
        popoverContent7: "命令跳转到文件系统。",
        popoverContent8: "使用示例：",
        command:"命令",
      },
      index: {
        title: "终端",
        content: "启动以下集群的终端：",
      },
    },
    _app: {
      sshError:"无法以用户身份连接到登录节点。请确认您的家目录的权限为700、750或者755",
      sftpError:"SFTP操作失败，请确认您是否有操作的权限",
      otherError:"服务器出错啦！",
    },
    dashboard: {
      title: "仪表盘",
    },
  },

};


