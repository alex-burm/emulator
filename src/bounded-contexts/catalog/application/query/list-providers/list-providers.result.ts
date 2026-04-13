export type ListProvidersResultItem = {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    authType: string;
    authConfig: Record<string, unknown> | null;
    baseUrl: string | null;
    defaultHeaders: Record<string, string> | null;
};
