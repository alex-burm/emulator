export class ProviderEndpointResponseDto {
    id!: number;
    method!: string;
    pathPattern!: string;
    description!: string | null;
    defaultStatus!: number;
    defaultResponse!: unknown | null;
    defaultHeaders!: Record<string, string> | null;
}
