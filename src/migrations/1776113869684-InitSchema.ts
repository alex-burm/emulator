import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1776113869684 implements MigrationInterface {
    name = 'InitSchema1776113869684';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`provider_endpoints\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`provider_id\` int UNSIGNED NOT NULL, \`method\` varchar(8) NOT NULL, \`path_pattern\` varchar(512) NOT NULL, \`description\` varchar(255) NULL, \`default_status\` int UNSIGNED NOT NULL DEFAULT '200', \`default_response\` json NULL, \`default_headers\` json NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_provider_endpoints_provider_id\` (\`provider_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`providers\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`slug\` varchar(64) NOT NULL, \`name\` varchar(128) NOT NULL, \`description\` text NULL, \`auth_type\` varchar(32) NOT NULL, \`base_url\` varchar(255) NULL, \`default_headers\` json NULL, \`auth_config\` json NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_cd3940cee2e13606345df5c573\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`endpoint_rules\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`project_id\` int UNSIGNED NOT NULL, \`provider_endpoint_id\` int UNSIGNED NOT NULL, \`name\` varchar(128) NOT NULL, \`priority\` int UNSIGNED NOT NULL, \`condition_source\` enum ('none', 'query_param', 'body_field', 'header', 'path_param') NOT NULL DEFAULT 'none', \`condition_key\` varchar(128) NULL, \`condition_operator\` enum ('eq', 'contains', 'exists', 'not_exists', 'regex') NULL, \`condition_value\` varchar(512) NULL, \`action_delay_ms\` int UNSIGNED NOT NULL DEFAULT '0', \`action_status\` int UNSIGNED NULL, \`action_response\` json NULL, \`action_random\` tinyint NOT NULL DEFAULT 0, \`is_enabled\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_endpoint_rules_project_endpoint_priority\` (\`project_id\`, \`provider_endpoint_id\`, \`priority\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`projects\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`name\` varchar(128) NOT NULL, \`hash\` varchar(12) NOT NULL, \`provider_id\` int UNSIGNED NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`UQ_projects_hash\` (\`hash\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `ALTER TABLE \`provider_endpoints\` ADD CONSTRAINT \`FK_152b8fc3cfa0181e92fb0dfffe1\` FOREIGN KEY (\`provider_id\`) REFERENCES \`providers\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`endpoint_rules\` ADD CONSTRAINT \`FK_b5dd72c1e7d15704251ffe6b0b2\` FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`endpoint_rules\` ADD CONSTRAINT \`FK_bb0de10e51ef22faca3f1e4a228\` FOREIGN KEY (\`provider_endpoint_id\`) REFERENCES \`provider_endpoints\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`projects\` ADD CONSTRAINT \`FK_aab1ce4dc40ebc9ef61d6702f5b\` FOREIGN KEY (\`provider_id\`) REFERENCES \`providers\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`projects\` DROP FOREIGN KEY \`FK_aab1ce4dc40ebc9ef61d6702f5b\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`endpoint_rules\` DROP FOREIGN KEY \`FK_bb0de10e51ef22faca3f1e4a228\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`endpoint_rules\` DROP FOREIGN KEY \`FK_b5dd72c1e7d15704251ffe6b0b2\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`provider_endpoints\` DROP FOREIGN KEY \`FK_152b8fc3cfa0181e92fb0dfffe1\``,
        );
        await queryRunner.query(
            `DROP INDEX \`UQ_projects_hash\` ON \`projects\``,
        );
        await queryRunner.query(`DROP TABLE \`projects\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_endpoint_rules_project_endpoint_priority\` ON \`endpoint_rules\``,
        );
        await queryRunner.query(`DROP TABLE \`endpoint_rules\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_cd3940cee2e13606345df5c573\` ON \`providers\``,
        );
        await queryRunner.query(`DROP TABLE \`providers\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_provider_endpoints_provider_id\` ON \`provider_endpoints\``,
        );
        await queryRunner.query(`DROP TABLE \`provider_endpoints\``);
    }
}
