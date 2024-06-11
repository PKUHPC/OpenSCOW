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
    linkTextMis: "Management System",
    linkTextPortal: "PORTAL",
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
    file: {
      fileManager: "File Manager",
      crossClusterFileTransfer: "File Transfer",
      clusterFileManager: "Cluster File Manager",
      transferProgress: "Transfer Progress",
    },
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
    startButton: "Start",
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
        successMessage: "Submitted successfully! Your new job ID is: ",
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
        hours:"Hours",
        days:"Days",
        workingDirectory: "Working Directory",
        wdTooltip1: "1. Please enter the absolute path. If you enter a relative path, it will be "
        + "relative to the user's home directory.",
        wdTooltip2: "2. If the specified directory is not accessible or cannot be operated on, "
        + "the job submission or execution will fail.",
        wdTooltip3: "2.This file is used to save the script returned by the adapter"
        + "The default value refers to the output file.",
        output: "Standard Output File",
        errorOutput: "Error Output File",
        saveJobSubmissionFile:"Save Job Submission File",
        totalNodeCount: "Total Nodes: ",
        totalGpuCount: "Total GPU Cards: ",
        totalCoreCount: "Total CPU Cores: ",
        totalMemory: "Total Memory Capacity: ",
        comment: "Comment",
        saveToTemplate: "Save as Template",
      },
    },
    fileManagerComp: {
      clusterFileTable: {
        fileName: "File Name",
        modificationDate: "Modification Date",
        size: "Size",
        permission: "Permission",
        notShowHiddenItem: "Do not show hidden items",
        showHiddenItem: "Show hidden items",
      },
      singleCrossClusterTransferSelector: {
        placeholder: "Please select a cluster",
      },
      transferInfoTable: {
        srcCluster: "Source Cluster",
        dstCluster: "Destination Cluster",
        file: "File",
        transferCount: "Transfer Count",
        transferSpeed: "Transfer Speed",
        timeLeft: "Time Remaining",
        currentProgress: "Current Progress",
        operation: "Operation",
        confirmCancelTitle: "Confirm Cancellation",
        confirmCancelContent: "Are you sure you want to cancel the transfer of the file {} from {} to {}?",
        confirmOk: "Confirm",
        cancelSuccess: "Cancellation Successful",
        cancel: "Cancel",
      },
      fileEditModal: {
        edit: "Edit",
        prompt: "Prompt",
        save: "Save",
        doNotSave: "Do Not Save",
        notSaved: "Not Saved",
        notSavePrompt: "The file has not been saved, do you want to save this file?",
        fileEdit: "File Edit",
        filePreview: "File Preview",
        fileLoading: "File is loading...",
        exitEdit: "Exit Edit Mode",
        failedGetFile: "Failed to get file: {}",
        cantReadFile: "Cannot read file: {}",
        saveFileFail: "File save failed: {}",
        saveFileSuccess: "File saved successfully",
        fileSizeExceeded: "File too large (maximum {}), please download and edit",
      },
      createFileModal: {
        createErrorMessage: "File or directory with the same name already exists!",
        createSuccessMessage: "Created successfully",
        create: "Create File",
        fileDirectory: "Directory to Create File",
        fileName: "File Name",
      },
      fileManager: {
        preview: {
          cantPreview: "File too large (maximum {}) or format not supported, please download to view",
        },
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
          operationStarted: "{} in progress, completed: ",
          operationNotStarted: "Selected {} {} items",
          notShowHiddenItem: "Do not Show Hidden Items",
          showHiddenItem: "Show Hidden Items",
          openInShell: "Open in Terminal",
          createFile: "New File",
          mkDir: "New Directory",
          download: "Download",
          rename: "Rename",
          deleteConfirmTitle: "Confirm Deletion",
          deleteConfirmContent: "Confirm deletion of {}?",
          deleteConfirmOk: "Confirm",
          deleteSuccessMessage: "Deleted successfully",
          submitConfirmTitle: "Submit Confirmation",
          submitConfirmContent: "Confirm submission of {} to {}?",
          submitConfirmOk: "Confirm",
          submitSuccessMessage: "Submitted successfully! Your new job ID is: {}",
          submitFailedMessage: "Submitted Failed",
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
        uploadRemark1: "File will be uploaded to: ",
        uploadRemark2: ". Files with the same name will be overwritten. ",
        uploadRemark3: "Maximum file size for single upload: ",
        uploadRemark4: ".",
        cancelUpload: "Cancel Upload",
        deleteUploadRecords: "Delete Upload Records",
        successMessage: "Uploaded successfully",
        errorMessage: "Upload failed",
        maxSizeErrorMessage: "{} upload failed, file size exceeded {} ",
        existedModalTitle: "File/Directory Already Exists",
        existedModalContent: "File/Directory {} already exists. Do you want to overwrite it?",
        existedModalOk: "Confirm",
        dragText: "Click or drag files here",
        hintText: "Supports uploading single or multiple files",
      },
    },
    // desktop
    desktop: {
      desktopTable: {
        tableItem: {
          title: "Desktop ID",
          desktopName: "Desktop Name",
          wm: "Desktop Type",
          addr: "Address",
          createTime: "Creation Time",
        },
        filterForm: {
          cluster: "Cluster",
          loginNode: "Login Node",
          createNewDesktop: "Create New Desktop",
        },
      },
      desktopTableActions: {
        popConfirmTitle: "This action is irreversible. Are you sure you want to delete?",
      },
      newDesktopModal: {
        error: {
          tooManyTitle: "Failed to Create Desktop",
          tooManyContent: "The number of desktops in this cluster has reached its maximum limit.",
        },
        modal: {
          createNewDesktop: "Create New Desktop",
          loginNode: "Login Node",
          wm: "Desktop",
          desktopName: "Desktop Name",
        },
      },
    },
    // app
    app: {
      appSessionTable: {
        table: {
          sessionId: "Job Name",
          jobId: "Job ID",
          appId: "Application",
          submitTime: "Submission Time",
          state: "Status",
          remainingTime: "Remaining Time",
          popFinishConfirmTitle: "Are you sure you want to end this task?",
          popFinishConfirmMessage: "Task termination request has been submitted.",
          popCancelConfirmTitle: "Are you sure you want to cancel this task?",
          popCancelConfirmMessage: "Task cancellation request has been submitted.",
          linkToPath: "Enter Directory",
        },
        filterForm: {
          appJobName: "Job Name",
          autoRefresh: "Auto-refresh every 10s",
          onlyNotEnded: "Show only unended tasks",
        },
      },
      connectToAppLink: {
        notFoundMessage: "This application session does not exist.",
        notConnectableMessage: "This application cannot be connected at the moment.",
        notReady: "Application is not ready yet.",
        connect: "Connect",
      },
      createApps: {
        notFoundMessage: "No interactive application available for creation.",
        loading: "Loading available interactive applications...",
        create: "Create",
      },
      launchAppForm: {
        errorMessage: "Failed to create application.",
        successMessage: "Successfully created.",
        loading: "Retrieving last submission records...",
        appJobName: "Job Name",
        account: "Account",
        partition: "Partition",
        qos: "QOS",
        nodeCount: "Node Count",
        gpuCount: "GPU Cards per Node",
        coreCount: "CPU Cores per Node",
        maxTime: "Maximum Running Time",
        minute: "Minutes",
        totalGpuCount: "Total GPU Cards",
        totalCpuCount: "Total CPU Cores",
        totalMemory: "Total Memory Capacity",
        appCommentTitle: "Explanation",
      },
    },
  },
  component: {
    errorPages: {
      notAllowedPage: "Access to this page is not allowed.",
      systemNotAllowed: "The system does not allow access to this page.",
      notAllowed: "Access Denied",
      needLogin: "Login Required",
      notLogin: "You are either not logged in or your login session has expired. "
      + "You need to login to access this page.",
      login: "Login",
      notExist: "Does Not Exist",
      pageNotExist: "The page you requested does not exist.",
      serverWrong: "Server Error",
      sorry: "Sorry, there was a server error. Please refresh and try again.",
    },
    others: {
      clusterSelector: "Please select a cluster.",
    },
  },
  pages: {
    apps: {
      create: {
        title: "Create ",
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
      fileTransfer: {
        confirmTransferTitle: "Confirm to start transfer?",
        confirmTransferContent: "Are you sure to transfer from {} to {}?",
        confirmOk: "Confirm",
        transferStartInfo: "Transfer task has started",
        transferTitle: "Cross-cluster file transfer",
      },
      currentTransferInfo: {
        checkTransfer: "Check file transfer progress",
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
        popoverContent1: "Navigate to the file system ",
        popoverContent2: "After entering this command, you will navigate to the file system, where you "
        + "can upload and download files.",
        popoverContent3: "Download a file",
        popoverContentFile: "File Name",
        popoverContent4: "By entering",
        popoverContent5: ", the file in your current path will be downloaded locally. Relative paths "
        + "are not supported at the moment.",
        popoverContent6: "If you need to download files from other directories, please use",
        popoverContent7: "command to navigate to the file system.",
        popoverContent8: "Usage example: ",
        command: "Command",
      },
      index: {
        title: "Terminal",
        content: "Launch terminal for the following clusters: ",
      },
    },
    _app: {
      sshError: "Unable to connect as a user to the login node. Please make sure the permissions "
      + "of your home directory are 700, 750, or 755.",
      textExceedsLength:"There are too many welcome messages for terminal login."
                         + "Please reduce unnecessary information output!",
      sftpError: "SFTP operation failed. Please confirm if you have the necessary permissions.",
      otherError: "Server encountered an error!",
    },
    dashboard: {
      title: "Dashboard",
    },
  },
};
