export type ProviderEndpointSeed = {
    method: string;
    pathPattern: string;
    description: string;
    defaultStatus: number;
    defaultResponse: Record<string, unknown>;
    defaultHeaders?: Record<string, string>;
};

export type ProviderSeed = {
    slug: string;
    name: string;
    description: string;
    authType: string;
    baseUrl: string;
    defaultHeaders: Record<string, string>;
    authConfig: Record<string, unknown>;
    endpoints: ProviderEndpointSeed[];
};
