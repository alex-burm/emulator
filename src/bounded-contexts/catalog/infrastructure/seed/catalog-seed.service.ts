import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TypeOrmProviderRepository } from '../persistence/provider.repository';
import { SERVICETITAN_PROVIDER_SEED } from './servicetitan.seed';
import { YELP_PROVIDER_SEED } from './yelp.seed';

@Injectable()
export class CatalogSeedService implements OnModuleInit {
    constructor(
        private readonly providerRepository: TypeOrmProviderRepository,
        private readonly logger: Logger,
    ) {}

    async onModuleInit(): Promise<void> {
        const isEmpty = await this.providerRepository.isEmpty();

        if (!isEmpty) {
            this.logger.log(
                'Catalog seed skipped: providers table is not empty.',
                CatalogSeedService.name,
            );
            return;
        }

        await this.providerRepository.seedProviders([
            SERVICETITAN_PROVIDER_SEED,
            YELP_PROVIDER_SEED,
        ]);

        this.logger.log(
            'Catalog seed completed: inserted ServiceTitan and Yelp providers.',
            CatalogSeedService.name,
        );
    }
}
