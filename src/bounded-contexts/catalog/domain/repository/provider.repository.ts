import { ProviderEntity } from '../entity/provider.entity';

export const PROVIDER_REPOSITORY = Symbol('PROVIDER_REPOSITORY');

export interface ProviderRepositoryInterface {
    findAll(): Promise<ProviderEntity[]>;
    findByIdWithEndpoints(id: number): Promise<ProviderEntity | null>;
}
