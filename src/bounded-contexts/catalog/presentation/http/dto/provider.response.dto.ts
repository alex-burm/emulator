import { ProviderEndpointResponseDto } from './provider-endpoint.response.dto';

export class ProviderResponseDto {
    id!: number;
    slug!: string;
    name!: string;
    description!: string | null;
    authType!: string;
    authConfig!: Record<string, unknown> | null;
    baseUrl!: string | null;
    defaultHeaders!: Record<string, string> | null;
    endpoints?: ProviderEndpointResponseDto[];
}
