import { Migration } from '@mikro-orm/migrations';

export class Migration20231223072956 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `algorithm` add `update_time` DATETIME(6) not null default current_timestamp(6);');

    this.addSql('alter table `algorithm_version` add `update_time` DATETIME(6) not null default current_timestamp(6);');

    this.addSql('alter table `dataset` add `update_time` DATETIME(6) not null default current_timestamp(6);');

    this.addSql('alter table `dataset_version` add `update_time` DATETIME(6) not null default current_timestamp(6);');

    this.addSql('alter table `image` add `update_time` DATETIME(6) not null default current_timestamp(6);');

    this.addSql('alter table `modal` add `update_time` DATETIME(6) not null default current_timestamp(6);');

    this.addSql('alter table `modal_version` add `update_time` DATETIME(6) not null default current_timestamp(6);');
  }

  async down(): Promise<void> {
    this.addSql('alter table `algorithm` drop `update_time`;');

    this.addSql('alter table `algorithm_version` drop `update_time`;');

    this.addSql('alter table `dataset` drop `update_time`;');

    this.addSql('alter table `dataset_version` drop `update_time`;');

    this.addSql('alter table `image` drop `update_time`;');

    this.addSql('alter table `modal` drop `update_time`;');

    this.addSql('alter table `modal_version` drop `update_time`;');
  }

}
