import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CatalogModule } from './bounded-contexts/catalog/catalog.module';
import { buildTypeOrmOptions } from './shared/infrastructure/database/typeorm.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
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
    ],
})
export class AppModule {}
