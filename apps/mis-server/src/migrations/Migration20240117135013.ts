import { Migration } from '@mikro-orm/migrations';

export class Migration20240117135013 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `charge_record` add `user_id` varchar(255) null, add `metadata` json null;');
    this.addSql('alter table `charge_record` drop index `query_info`;');
    this.addSql('alter table `charge_record` add index `query_info`(`time`, `tenant_name`, `account_name`, `type`, `user_id`);');

    this.addSql('alter table `tenant` modify `create_time` DATETIME(6) not null default current_timestamp(6);');

    this.addSql('alter table `user` modify `create_time` DATETIME(6) not null default current_timestamp(6);');
  }

  async down(): Promise<void> {
    this.addSql('alter table `charge_record` drop index `query_info`;');
    this.addSql('alter table `charge_record` drop `user_id`;');
    this.addSql('alter table `charge_record` drop `metadata`;');
    this.addSql('alter table `charge_record` add index `query_info`(`time`, `tenant_name`, `account_name`, `type`);');

    this.addSql('alter table `tenant` modify `create_time` DATETIME(6) not null default current_timestamp(0);');

    this.addSql('alter table `user` modify `create_time` DATETIME(6) not null default current_timestamp(0);');
  }

}
