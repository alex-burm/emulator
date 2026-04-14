import { ProviderEndpointEntity } from '../entity/provider-endpoint.entity';
import { ProviderEntity } from '../entity/provider.entity';

export const PROVIDER_REPOSITORY = Symbol('PROVIDER_REPOSITORY');

export interface ProviderRepositoryInterface {
    findAll(): Promise<ProviderEntity[]>;
    findByIdWithEndpoints(id: number): Promise<ProviderEntity | null>;
    existsById(id: number): Promise<boolean>;
    findEndpointById(id: number): Promise<ProviderEndpointEntity | null>;
    findEndpointsByProviderId(
        providerId: number,
    ): Promise<ProviderEndpointEntity[]>;
}
