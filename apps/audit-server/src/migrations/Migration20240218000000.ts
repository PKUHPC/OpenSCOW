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

/* eslint-disable @stylistic/max-len */

import { Migration } from "@mikro-orm/migrations";

export class Migration20240129000000 extends Migration {

  async up(): Promise<void> {
    this.addSql(`
      UPDATE operation_log
      SET meta_data = JSON_SET(meta_data, '$.submitJob.clusterId', '')
      WHERE JSON_UNQUOTE(JSON_EXTRACT(meta_data, '$.$case')) = 'submitJob';
    `);
    this.addSql(`
      UPDATE operation_log
      SET meta_data = JSON_SET(meta_data, '$.endJob.clusterId', '')
      WHERE JSON_UNQUOTE(JSON_EXTRACT(meta_data, '$.$case')) = 'endJob';
    `);
    this.addSql(`
      UPDATE operation_log
      SET meta_data = JSON_SET(meta_data, '$.addJobTemplate.clusterId', '')
      WHERE JSON_UNQUOTE(JSON_EXTRACT(meta_data, '$.$case')) = 'addJobTemplate';
    `);
    this.addSql(`
      UPDATE operation_log
      SET meta_data = JSON_SET(meta_data, '$.deleteJobTemplate.clusterId', '')
      WHERE JSON_UNQUOTE(JSON_EXTRACT(meta_data, '$.$case')) = 'deleteJobTemplate';
    `);
    this.addSql(`
      UPDATE operation_log
      SET meta_data = JSON_SET(meta_data, '$.updateJobTemplate.clusterId', '')
      WHERE JSON_UNQUOTE(JSON_EXTRACT(meta_data, '$.$case')) = 'updateJobTemplate';
    `);
    this.addSql(`
      UPDATE operation_log
      SET meta_data = JSON_SET(meta_data, '$.createDesktop.clusterId', '', '$.createDesktop.loginNode', '')
      WHERE JSON_UNQUOTE(JSON_EXTRACT(meta_data, '$.$case')) = 'createDesktop';
    `);
    this.addSql(`
      UPDATE operation_log
      SET meta_data = JSON_SET(meta_data, '$.deleteDesktop.clusterId', '')
      WHERE JSON_UNQUOTE(JSON_EXTRACT(meta_data, '$.$case')) = 'deleteDesktop';
    `);
    this.addSql(`
      UPDATE operation_log
      SET meta_data = JSON_SET(meta_data, '$.createApp.clusterId', '')
      WHERE JSON_UNQUOTE(JSON_EXTRACT(meta_data, '$.$case')) = 'createApp';
    `);
    this.addSql(`
      UPDATE operation_log
      SET meta_data = JSON_SET(meta_data, '$.setJobTimeLimit.clusterId', '')
      WHERE JSON_UNQUOTE(JSON_EXTRACT(meta_data, '$.$case')) = 'setJobTimeLimit';
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      UPDATE operation_log
      SET meta_data = JSON_REMOVE(meta_data, '$.submitJob.clusterId')
      WHERE JSON_UNQUOTE(JSON_EXTRACT(meta_data, '$.$case')) = 'submitJob' AND JSON_CONTAINS_PATH(meta_data, 'one', '$.submitJob.clusterId');
    `);
    this.addSql(`
      UPDATE operation_log
      SET meta_data = JSON_REMOVE(meta_data, '$.endJob.clusterId')
      WHERE JSON_UNQUOTE(JSON_EXTRACT(meta_data, '$.$case')) = 'endJob' AND JSON_CONTAINS_PATH(meta_data, 'one', '$.endJob.clusterId');
    `);
    this.addSql(`
      UPDATE operation_log
      SET meta_data = JSON_REMOVE(meta_data, '$.addJobTemplate.clusterId')
      WHERE JSON_UNQUOTE(JSON_EXTRACT(meta_data, '$.$case')) = 'addJobTemplate' AND JSON_CONTAINS_PATH(meta_data, 'one', '$.addJobTemplate.clusterId');
    `);
    this.addSql(`
      UPDATE operation_log
      SET meta_data = JSON_REMOVE(meta_data, '$.deleteJobTemplate.clusterId')
      WHERE JSON_UNQUOTE(JSON_EXTRACT(meta_data, '$.$case')) = 'deleteJobTemplate' AND JSON_CONTAINS_PATH(meta_data, 'one', '$.deleteJobTemplate.clusterId');
    `);
    this.addSql(`
      UPDATE operation_log
      SET meta_data = JSON_REMOVE(meta_data, '$.updateJobTemplate.clusterId')
      WHERE JSON_UNQUOTE(JSON_EXTRACT(meta_data, '$.$case')) = 'updateJobTemplate' AND JSON_CONTAINS_PATH(meta_data, 'one', '$.updateJobTemplate.clusterId');
    `);
    this.addSql(`
      UPDATE operation_log
      SET meta_data = JSON_REMOVE(meta_data,'$.createDesktop.clusterId','$.createDesktop.loginNode')
      WHERE JSON_UNQUOTE(JSON_EXTRACT(meta_data, '$.$case')) = 'createDesktop'
      AND JSON_CONTAINS_PATH(meta_data, 'one', '$.createDesktop.clusterId')
      AND JSON_CONTAINS_PATH(meta_data, 'one', '$.createDesktop.loginNode');
    `);
    this.addSql(`
      UPDATE operation_log
      SET meta_data = JSON_REMOVE(meta_data, '$.createApp.clusterId')
      WHERE JSON_UNQUOTE(JSON_EXTRACT(meta_data, '$.$case')) = 'createApp' AND JSON_CONTAINS_PATH(meta_data, 'one', '$.createApp.clusterId');
    `);
    this.addSql(`
      UPDATE operation_log
      SET meta_data = JSON_REMOVE(meta_data, '$.setJobTimeLimit.clusterId')
      WHERE JSON_UNQUOTE(JSON_EXTRACT(meta_data, '$.$case')) = 'setJobTimeLimit' AND JSON_CONTAINS_PATH(meta_data, 'one', '$.setJobTimeLimit.clusterId');
    `);
  }
}
