import { Migration } from '@mikro-orm/migrations';

export class Migration20231107091531 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `query_cache` (`id` int unsigned not null auto_increment primary key, `query_key` varchar(255) not null, `query_result` json not null, `timestamp` DATETIME(6) not null) default character set utf8mb4 engine = InnoDB;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists `query_cache`;');
  }

}
