import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PROVIDER_REPOSITORY } from '../../../domain/repository/provider.repository';
import type { ProviderRepositoryInterface } from '../../../domain/repository/provider.repository';
import { ListProvidersQuery } from './list-providers.query';
import { ListProvidersResultItem } from './list-providers.result';

@QueryHandler(ListProvidersQuery)
export class ListProvidersHandler
    implements IQueryHandler<ListProvidersQuery, ListProvidersResultItem[]>
{
    constructor(
        @Inject(PROVIDER_REPOSITORY)
        private readonly providerRepository: ProviderRepositoryInterface,
    ) {}

    async execute(): Promise<ListProvidersResultItem[]> {
        const providers = await this.providerRepository.findAll();

        return providers.map((provider) => ({
            id: provider.id,
            slug: provider.slug,
            name: provider.name,
            description: provider.description,
            authType: provider.authType,
            authConfig: provider.authConfig,
            baseUrl: provider.baseUrl,
            defaultHeaders: provider.defaultHeaders,
        }));
    }
}
