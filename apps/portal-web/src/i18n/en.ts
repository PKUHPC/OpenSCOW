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
  // baseLayout
  baseLayout: {
    linkText: "Management System",
  },
  // routes
  routes: {
    dashboard: "Dashboard",
    job: {
      title: "Jobs",
      runningJobs: "Running Jobs",
      allJobs: "All Jobs",
      submitJob: "Submit Job",
      jobTemplates: "Job Templates",
    },
    desktop: "Desktop",
    apps: {
      title: "Interactive Apps",
      appSessions: "Created Apps",
      createApp: "Create App",
    },
    file: "File Management",
  },
  // button
  button: {
    searchButton: "Search",
    refreshButton: "Refresh",
    cancelButton: "Cancel",
    confirmButton: "Confirm",
    selectButton: "Select",
    actionButton: "Action",
    deleteButton: "Delete",
    renameButton: "Rename",
    finishButton: "Finish",
    detailButton: "Details",
    submitButton: "Submit",
    closeButton: "Close",
  },
  // pageComp
  pageComp: {
    // profile
    profile: {
      changPasswordModal: {
        successMessage: "Password changed successfully",
        errorMessage: "Incorrect original password",
        changePassword: "Change Password",
        oldPassword: "Old Password",
        newPassword: "New Password",
        confirm: "Confirm Password",
      },
    },
    // job
    job: {
      accountSelector: {
        selectAccountPlaceholder: "Select Account",
        refreshAccountList: "Refresh Account List",
      },
      allJobsTable: {
        searchForm: {
          clusterLabel: "Cluster",
          time: "Time",
          popoverTitle: "Query all active jobs (such as job submission, pending, started, running, "
          + "failed, completed) in this time range",
          jobId: "Job ID",
        },
        tableInfo: {
          jobId: "Job ID",
          jobName: "Job Name",
          account: "Account",
          partition: "Partition",
          qos: "QOS",
          state: "State",
          submitTime: "Submission Time",
          startTime: "Start Time",
          endTime: "End Time",
          elapsed: "Elapsed Time",
          timeLimit: "Job Time Limit",
          reason: "Reason",
          more: "More",
          linkToPath: "Go to Directory",
        },
      },
      // fileSelectModal
      fileSelectModal: {
        title: "File Directory Selection Box",
        newPath: "New Directory",
      },
      // jobTemplateModal
      jobTemplateModal: {
        clusterLabel: "Cluster",
        errorMessage: "Template does not exist!",
        changeSuccessMessage: "Modified successfully!",
        changTemplateName: "Change Template Name",
        newTemplateName: "New Template Name",
        templateName: "Template Name",
        comment: "Comment",
        useTemplate: "Use Template",
        popConfirm: "Are you sure you want to delete this template?",
        deleteSuccessMessage: "Template has been deleted!",
      },
      // runningJobDrawer
      runningJobDrawer: {
        cluster: "Cluster",
        jobId: "Job ID",
        account: "Account",
        jobName: "Job Name",
        partition: "Partition",
        qos: "QOS",
        nodes: "Number of Nodes",
        cores: "Number of Cores",
        gpus: "Number of GPU Cards",
        state: "State",
        nodesOrReason: "Reason",
        runningOrQueueTime: "Running/Queue Time",
        submissionTime: "Submission Time",
        timeLimit: "Job Time Limit (minutes)",
        drawerTitle: "Details of Running Jobs",
      },
      // runningJobTable
      runningJobTable: {
        filterForm: {
          cluster: "Cluster",
          jobId: "Job ID",
        },
        jobInfoTable: {
          cluster: "Cluster",
          jobId: "Job ID",
          user: "User",
          account: "Account",
          name: "Job Name",
          partition: "Partition",
          qos: "QOS",
          nodes: "Nodes",
          cores: "Cores",
          gpus: "GPUs",
          state: "State",
          runningOrQueueTime: "Running/Queue Time",
          nodesOrReason: "Reason",
          timeLimit: "Job Time Limit",
          more: "More",
          linkToPath: "Go to Directory",
          popConfirm: "Are you sure you want to terminate this task?",
          successMessage: "Task termination request has been submitted!",
        },
      },
      // submitJobForm
      submitJobForm: {
        errorMessage: "Failed to submit job",
        successMessage: "Submitted successfully! Your new job ID is:",
        cluster: "Cluster",
        jobName: "Job Name",
        command: "Command",
        account: "Account",
        partition: "Partition",
        qos: "QOS",
        nodeCount: "Number of Nodes",
        gpuCount: "Number of GPU Cards per Node",
        coreCount: "Number of CPU Cores per Node",
        maxTime: "Maximum Running Time",
        minute: "Minutes",
        workingDirectory: "Working Directory",
        wdTooltip1: "1. Please enter the absolute path. If you enter a relative path, it will be "
        + "relative to the user's home directory.",
        wdTooltip2: "2. If the specified directory is not accessible or cannot be operated on, "
        + "the job submission or execution will fail.",
        output: "Standard Output File",
        errorOutput: "Error Output File",
        totalNodeCount: "Total Nodes:",
        totalGpuCount: "Total GPU Cards:",
        totalCoreCount: "Total CPU Cores:",
        totalMemory: "Total Memory Capacity:",
        comment: "Comment",
        saveToTemplate: "Save as Template",
      },
    },
    fileManagerComp: {
      createFileModal: {
        createErrorMessage: "File or directory with the same name already exists!",
        createSuccessMessage: "Created successfully",
        create: "Create File",
        fileDirectory: "Directory to Create File",
        fileName: "File Name",
      },
      fileManager: {
        moveCopy: {
          copy: "Copy",
          move: "Move",
          modalErrorTitle: "Error {} {}",
          existModalTitle: "File/Directory Already Exists",
          existModalContent: "File/Directory {} already exists. Do you want to overwrite it?",
          existModalOk: "Confirm",
          errorMessage: "{} error! A total of {} files/directories, {} succeeded, {} abandoned, {} failed",
          successMessage: "{} succeeded! A total of {} files/directories, {} succeeded, {} abandoned",
        },
        delete: {
          confirmTitle: "Confirm Deletion",
          confirmOk: "Confirm",
          confirmContent: "Are you sure you want to delete selected {}?",
          successMessage: "Deleted {} successfully!",
          errorMessage: "Deleted {} items, failed {} items",
          otherErrorMessage: "Error occurred while performing delete operation",
        },
        tableInfo: {
          title: "Cluster {} File Management",
          uploadButton: "Upload File",
          deleteSelected: "Delete Selected",
          copySelected: "Copy Selected",
          moveSelected: "Move Selected",
          paste: "Paste Here",
          operationStarted: "{} in progress, completed:",
          operationNotStarted: "Selected {} {} items",
          hidden: "Hidden",
          notHidden: "Show",
          hiddenItem: "Hidden Items",
          openInShell: "Open in Terminal",
          createFile: "New File",
          mkDir: "New Directory",
          download: "Download",
          rename: "Rename",
          deleteConfirmTitle: "Confirm Deletion",
          deleteConfirmContent: "Confirm deletion of {}?",
          deleteConfirmOk: "Confirm",
          deleteSuccessMessage: "Deleted successfully",
        },
      },
      fileTable: {
        fileName: "File Name",
        changeTime: "Modification Date",
        size: "Size",
        mode: "Permissions",
        action: "Action",
      },
      mkDirModal: {
        existedErrorMessage: "File or directory with the same name already exists!",
        successMessage: "Created successfully",
        title: "Create Directory",
        mkdirLabel: "Directory to Create",
        dirName: "Directory Name",
      },
      renameModal: {
        successMessage: "Renamed successfully",
        title: "Rename File",
        renameLabel: "File to Rename",
        newFileName: "New File Name",
      },
      uploadModal: {
        title: "Upload File",
        uploadRemark1: "File will be uploaded to:",
        uploadRemark2: ". Files with the same name will be overwritten.",
        uploadRemark3: "Maximum file size for single upload:",
        uploadRemark4: ".",
        cancelUpload: "Cancel Upload",
        deleteUploadRecords: "Delete Upload Records",
        successMessage: "Uploaded successfully",
        errorMessage: "Upload failed",
        maxSizeErrorMessage: "{} upload failed, file size exceeded {}",
        existedModalTitle: "File/Directory Already Exists",
        existedModalContent: "File/Directory {} already exists. Do you want to overwrite it?",
        existedModalOk: "Confirm",
        dragText: "Click or drag files here",
        hintText: "Supports uploading single or multiple files",
      },
    },
  },
  pages: {
    apps: {
      create: {
        title: "Create",
        error404: "This app does not exist",
      },
      createApps: {
        subTitle: "The requested cluster does not exist",
        title: "Create App",
        pageTitle: "Create an App on {} Cluster",
      },
      sessions: {
        subTitle: "The requested cluster does not exist",
        title: "Interactive Apps",
        pageTitle: "{} Cluster Interactive Apps",
      },
    },
    desktop: {
      title: "Desktop",
      pageTitle: "Desktop on Login Node",
    },
    files: {
      path: {
        subTitle: "The requested cluster does not exist",
        title: "File Management",
      },
    },
    jobs: {
      allJobs: {
        title: "Historical Jobs",
        pageTitle: "All Historical Jobs of this User",
      },
      runningJobs: {
        title: "Running Jobs",
        pageTitle: "Unfinished Jobs of this User",
      },
      savedJobs: {
        title: "Job Templates",
        pageTitle: "Job Template List",
      },
      submit: {
        title: "Submit Job",
        pageTitle: "Submit Job",
        spin: "Loading job templates",
      },
    },
    profile: {
      title: "Account Information",
      userInfo: "User Information",
      identityId: "User ID",
      name: "User Name",
      changePassword: "Change Password",
      loginPassword: "Login Password",
    },
    shell: {
      loginNode: {
        title: "Terminal",
        content: "Connected to {} cluster's {} node with ID: {}",
        reloadButton: "Refresh and Reconnect",
        popoverTitle: "Commands",
        popoverContent1: "Navigate to the file system",
        popoverContent2: "After entering this command, you will navigate to the file system, where you "
        + "can upload and download files.",
        popoverContent3: "Download a file",
        popoverContentFile: "File Name",
        popoverContent4: "By entering",
        popoverContent5: ", the file in your current path will be downloaded locally. Relative paths "
        + "are not supported at the moment.",
        popoverContent6: "If you need to download files from other directories, please use",
        popoverContent7: "command to navigate to the file system.",
        popoverContent8: "Usage example:",
        command: "Command",
      },
      index: {
        title: "Terminal",
        content: "Launch terminal for the following clusters:",
      },
    },
    _app: {
      sshError: "Unable to connect as a user to the login node. Please make sure the permissions "
      + "of your home directory are 700, 750, or 755.",
      sftpError: "SFTP operation failed. Please confirm if you have the necessary permissions.",
      otherError: "Server encountered an error!",
    },
    dashboard: {
      title: "Dashboard",
    },
  },
};
