import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TypeOrmProviderRepository } from '../persistence/provider.repository';
import { DEFAULT_PROVIDER_SEED } from './default.seed';
import { SERVICETITAN_PROVIDER_SEED } from './servicetitan.seed';
import { YELP_PROVIDER_SEED } from './yelp.seed';

@Injectable()
export class CatalogSeedService implements OnModuleInit {
    private readonly providerSeeds = [
        SERVICETITAN_PROVIDER_SEED,
        YELP_PROVIDER_SEED,
        DEFAULT_PROVIDER_SEED,
    ];

    constructor(
        private readonly providerRepository: TypeOrmProviderRepository,
        private readonly logger: Logger,
    ) {}

    async onModuleInit(): Promise<void> {
        const isEmpty = await this.providerRepository.isEmpty();

        if (!isEmpty) {
            await this.providerRepository.syncMissingSeedEndpoints(
                this.providerSeeds,
            );
            this.logger.log(
                'Catalog seed synced: added missing seed endpoints for existing providers.',
                CatalogSeedService.name,
            );
            return;
        }

        await this.providerRepository.seedProviders(this.providerSeeds);

        this.logger.log(
            'Catalog seed completed: inserted ServiceTitan and Yelp providers.',
            CatalogSeedService.name,
        );
    }

    async runFullSync(): Promise<void> {
        const result = await this.providerRepository.upsertAllSeedEndpoints(
            this.providerSeeds,
        );
        this.logger.log(
            `Seed full sync done: ${result.providers} providers, ` +
                `${result.inserted} endpoints inserted, ${result.updated} updated.`,
            CatalogSeedService.name,
        );
    }
}
