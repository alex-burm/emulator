import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PROVIDER_REPOSITORY } from '../../../domain/repository/provider.repository';
import type { ProviderRepositoryInterface } from '../../../domain/repository/provider.repository';
import { GetProviderWithEndpointsQuery } from './get-provider-with-endpoints.query';
import { GetProviderWithEndpointsResult } from './get-provider-with-endpoints.result';

@QueryHandler(GetProviderWithEndpointsQuery)
export class GetProviderWithEndpointsHandler
    implements
        IQueryHandler<
            GetProviderWithEndpointsQuery,
            GetProviderWithEndpointsResult
        >
{
    constructor(
        @Inject(PROVIDER_REPOSITORY)
        private readonly providerRepository: ProviderRepositoryInterface,
    ) {}

    async execute(
        query: GetProviderWithEndpointsQuery,
    ): Promise<GetProviderWithEndpointsResult> {
        const provider = await this.providerRepository.findByIdWithEndpoints(
            query.providerId,
        );

        if (!provider) {
            throw new NotFoundException(
                `Provider with id=${query.providerId} not found`,
            );
        }

        return {
            id: provider.id,
            slug: provider.slug,
            name: provider.name,
            description: provider.description,
            authType: provider.authType,
            authConfig: provider.authConfig,
            baseUrl: provider.baseUrl,
            defaultHeaders: provider.defaultHeaders,
            endpoints: provider.endpoints.map((endpoint) => ({
                id: endpoint.id,
                method: endpoint.method,
                pathPattern: endpoint.pathPattern,
                description: endpoint.description,
                defaultStatus: endpoint.defaultStatus,
                defaultResponse: endpoint.defaultResponse,
                defaultHeaders: endpoint.defaultHeaders,
            })),
        };
    }
}
