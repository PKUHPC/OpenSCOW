import { Migration } from '@mikro-orm/migrations';

export class Migration20230728061650 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `operation_log` (`id` int unsigned not null auto_increment primary key, `operator_id` int unsigned not null, `operator_ip` varchar(255) not null, `operation_time` datetime not null default current_timestamp(0), `operation_code` int not null, `operation_content` text not null, `operation_result` varchar(255) not null default "UNKNOWN") default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `operation_log` add index `operation_log_operator_id_index`(`operator_id`);');

    this.addSql('alter table `operation_log` add constraint `operation_log_operator_id_foreign` foreign key (`operator_id`) references `user` (`id`) on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists `operation_log`;');
  }

}
