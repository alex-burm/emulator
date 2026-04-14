export type GetProviderWithEndpointsResultEndpoint = {
    id: number;
    method: string;
    pathPattern: string;
    description: string | null;
    defaultStatus: number;
    defaultResponse: unknown | null;
    defaultHeaders: Record<string, string> | null;
};

export type GetProviderWithEndpointsResult = {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    authType: string;
    authConfig: Record<string, unknown> | null;
    baseUrl: string | null;
    defaultHeaders: Record<string, string> | null;
    endpoints: GetProviderWithEndpointsResultEndpoint[];
};
