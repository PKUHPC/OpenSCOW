import { Migration } from '@mikro-orm/migrations';

export class Migration20230816110508 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `operation_log` modify `operation_time` DATETIME(6) not null default current_timestamp(0), modify `operation_result` enum(\'UNKNOWN\', \'SUCCESS\', \'FAIL\') not null comment \'UNKNOWN, SUCCESS, FAIL\';');
  }

  async down(): Promise<void> {
    this.addSql('alter table `operation_log` modify `operation_time` datetime not null default current_timestamp(0), modify `operation_result` text not null comment \'UNKNOWN, SUCCESS, FAIL\';');
  }

}
