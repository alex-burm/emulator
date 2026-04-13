export class ProviderEndpointResponseDto {
    id!: number;
    method!: string;
    pathPattern!: string;
    description!: string | null;
    defaultStatus!: number;
    defaultResponse!: Record<string, unknown> | null;
    defaultHeaders!: Record<string, string> | null;
}
