/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
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

export class Migration20240131083455 extends Migration {

  async up(): Promise<void> {
    this.addSql("alter table `algorithm_version` drop foreign key `algorithm_version_algorithm_id_foreign`;");

    this.addSql("alter table `dataset_version` drop foreign key `dataset_version_dataset_id_foreign`;");

    this.addSql("alter table `model_version` drop foreign key `model_version_model_id_foreign`;");

    this.addSql("alter table `algorithm_version` add constraint `algorithm_version_algorithm_id_foreign` foreign key (`algorithm_id`) references `algorithm` (`id`) on update cascade on delete cascade;");

    this.addSql("alter table `dataset_version` add constraint `dataset_version_dataset_id_foreign` foreign key (`dataset_id`) references `dataset` (`id`) on update cascade on delete cascade;");

    this.addSql("alter table `model_version` add constraint `model_version_model_id_foreign` foreign key (`model_id`) references `model` (`id`) on update cascade on delete cascade;");
  }

  async down(): Promise<void> {
    this.addSql("alter table `algorithm_version` drop foreign key `algorithm_version_algorithm_id_foreign`;");

    this.addSql("alter table `dataset_version` drop foreign key `dataset_version_dataset_id_foreign`;");

    this.addSql("alter table `model_version` drop foreign key `model_version_model_id_foreign`;");

    this.addSql("alter table `algorithm_version` add constraint `algorithm_version_algorithm_id_foreign` foreign key (`algorithm_id`) references `algorithm` (`id`) on update cascade;");

    this.addSql("alter table `dataset_version` add constraint `dataset_version_dataset_id_foreign` foreign key (`dataset_id`) references `dataset` (`id`) on update cascade;");

    this.addSql("alter table `model_version` add constraint `model_version_model_id_foreign` foreign key (`model_id`) references `model` (`id`) on update cascade;");
  }

}
