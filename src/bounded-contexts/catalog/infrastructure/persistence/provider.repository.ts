import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProviderEndpointEntity } from '../../domain/entity/provider-endpoint.entity';
import { ProviderEntity } from '../../domain/entity/provider.entity';
import { ProviderRepositoryInterface } from '../../domain/repository/provider.repository';
import { ProviderSeed } from '../seed/catalog-seed.types';

@Injectable()
export class TypeOrmProviderRepository implements ProviderRepositoryInterface {
    constructor(
        @InjectRepository(ProviderEntity)
        private readonly providerRepository: Repository<ProviderEntity>,
        @InjectRepository(ProviderEndpointEntity)
        private readonly providerEndpointRepository: Repository<ProviderEndpointEntity>,
        private readonly dataSource: DataSource,
    ) {}

    async isEmpty(): Promise<boolean> {
        const count = await this.providerRepository.count();
        return count === 0;
    }

    async seedProviders(providerSeeds: ProviderSeed[]): Promise<void> {
        await this.dataSource.transaction(async (manager) => {
            for (const providerSeed of providerSeeds) {
                const providerEntity = manager.create(ProviderEntity, {
                    slug: providerSeed.slug,
                    name: providerSeed.name,
                    description: providerSeed.description,
                    authType: providerSeed.authType,
                    baseUrl: providerSeed.baseUrl,
                    defaultHeaders: providerSeed.defaultHeaders,
                    authConfig: providerSeed.authConfig,
                });

                const savedProvider = await manager.save(
                    ProviderEntity,
                    providerEntity,
                );

                const endpointEntities = providerSeed.endpoints.map(
                    (endpoint) =>
                        manager.create(ProviderEndpointEntity, {
                            providerId: savedProvider.id,
                            method: endpoint.method,
                            pathPattern: endpoint.pathPattern,
                            description: endpoint.description,
                            defaultStatus: endpoint.defaultStatus,
                            defaultResponse: endpoint.defaultResponse,
                            defaultHeaders: endpoint.defaultHeaders ?? {
                                'Content-Type': 'application/json',
                            },
                        }),
                );

                await manager.save(ProviderEndpointEntity, endpointEntities);
            }
        });
    }

    async findAll(): Promise<ProviderEntity[]> {
        return this.providerRepository.find({
            order: { id: 'ASC' },
        });
    }

    async findByIdWithEndpoints(id: number): Promise<ProviderEntity | null> {
        const provider = await this.providerRepository.findOne({
            where: { id },
        });

        if (!provider) {
            return null;
        }

        provider.endpoints = await this.providerEndpointRepository.find({
            where: { providerId: provider.id },
            order: { id: 'ASC' },
        });

        return provider;
    }

    async existsById(id: number): Promise<boolean> {
        const count = await this.providerRepository.count({ where: { id } });
        return count > 0;
    }

    async findEndpointById(id: number): Promise<ProviderEndpointEntity | null> {
        return this.providerEndpointRepository.findOne({ where: { id } });
    }

    async findEndpointsByProviderId(
        providerId: number,
    ): Promise<ProviderEndpointEntity[]> {
        return this.providerEndpointRepository.find({
            where: { providerId },
            order: { id: 'ASC' },
        });
    }
}
