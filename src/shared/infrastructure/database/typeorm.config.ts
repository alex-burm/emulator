import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'node:path';

type DbEnv = {
  DB_HOST?: string;
  DB_PORT?: string;
  DB_USER?: string;
  DB_PASS?: string;
  DB_NAME?: string;
};

export function buildTypeOrmOptions(env: DbEnv): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: env.DB_HOST ?? 'localhost',
    port: Number(env.DB_PORT ?? 3306),
    username: env.DB_USER ?? 'root',
    password: env.DB_PASS ?? '',
    database: env.DB_NAME ?? 'emulator',
    synchronize: false,
    entities: [
      path.join(process.cwd(), 'src/**/*.orm-entity.ts'),
      path.join(process.cwd(), 'dist/**/*.orm-entity.js'),
    ],
    migrations: [
      path.join(process.cwd(), 'src/migrations/*{.ts,.js}'),
      path.join(process.cwd(), 'dist/migrations/*.js'),
    ],
  };
}

const dataSourceOptions: DataSourceOptions = buildTypeOrmOptions(
  process.env as unknown as DbEnv,
) as DataSourceOptions;

export default new DataSource(dataSourceOptions);
