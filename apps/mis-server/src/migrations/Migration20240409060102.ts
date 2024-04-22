import { Migration } from '@mikro-orm/migrations';

export class Migration20240409060102 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `cluster` (`id` int unsigned not null auto_increment primary key, `cluster_id` varchar(255) not null, `online_status` enum(\'ONLINE\', \'OFFLINE\') not null default \'ONLINE\' comment \'ONLINE, OFFLINE\', `operator_id` varchar(255) null, `comment` varchar(255) not null default \'\', `create_time` DATETIME(6) null, `update_time` DATETIME(6) null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `cluster` add unique `cluster_cluster_id_unique`(`cluster_id`);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists `cluster`;');
  }

}
