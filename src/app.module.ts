import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CatalogModule } from './bounded-contexts/catalog/catalog.module';
import { WorkspaceModule } from './bounded-contexts/workspace/workspace.module';
import { buildTypeOrmOptions } from './shared/infrastructure/database/typeorm.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
            exclude: ['/api/(.*)', '/emulate/(.*)'],
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService): TypeOrmModuleOptions =>
                buildTypeOrmOptions({
                    DB_HOST: configService.get<string>('DB_HOST'),
                    DB_PORT: configService.get<string>('DB_PORT'),
                    DB_USER: configService.get<string>('DB_USER'),
                    DB_PASS: configService.get<string>('DB_PASS'),
                    DB_NAME: configService.get<string>('DB_NAME'),
                }),
        }),
        CatalogModule,
        WorkspaceModule,
    ],
})
export class AppModule {}
