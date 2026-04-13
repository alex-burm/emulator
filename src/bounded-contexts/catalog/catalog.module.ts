import { Logger } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetProviderWithEndpointsHandler } from './application/query/get-provider-with-endpoints/get-provider-with-endpoints.handler';
import { ListProvidersHandler } from './application/query/list-providers/list-providers.handler';
import { ProviderEndpointEntity } from './domain/entity/provider-endpoint.entity';
import { ProviderEntity } from './domain/entity/provider.entity';
import { PROVIDER_REPOSITORY } from './domain/repository/provider.repository';
import { TypeOrmProviderRepository } from './infrastructure/persistence/provider.repository';
import { CatalogSeedService } from './infrastructure/seed/catalog-seed.service';
import { CatalogController } from './presentation/http/catalog.controller';

const queryHandlers = [ListProvidersHandler, GetProviderWithEndpointsHandler];

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([ProviderEntity, ProviderEndpointEntity]),
    ],
    controllers: [CatalogController],
    providers: [
        Logger,
        TypeOrmProviderRepository,
        {
            provide: PROVIDER_REPOSITORY,
            useExisting: TypeOrmProviderRepository,
        },
        CatalogSeedService,
        ...queryHandlers,
    ],
    exports: [PROVIDER_REPOSITORY, TypeOrmProviderRepository],
})
export class CatalogModule {}
