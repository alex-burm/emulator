import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetProviderWithEndpointsQuery } from '../../application/query/get-provider-with-endpoints/get-provider-with-endpoints.query';
import { GetProviderWithEndpointsResult } from '../../application/query/get-provider-with-endpoints/get-provider-with-endpoints.result';
import { ListProvidersQuery } from '../../application/query/list-providers/list-providers.query';
import { ListProvidersResultItem } from '../../application/query/list-providers/list-providers.result';

@Controller('providers')
export class CatalogController {
    constructor(private readonly queryBus: QueryBus) {}

    @Get()
    async listProviders(): Promise<ListProvidersResultItem[]> {
        return this.queryBus.execute<
            ListProvidersQuery,
            ListProvidersResultItem[]
        >(new ListProvidersQuery());
    }

    @Get(':id/endpoints')
    async getProviderWithEndpoints(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<GetProviderWithEndpointsResult> {
        return this.queryBus.execute<
            GetProviderWithEndpointsQuery,
            GetProviderWithEndpointsResult
        >(new GetProviderWithEndpointsQuery(id));
    }
}
