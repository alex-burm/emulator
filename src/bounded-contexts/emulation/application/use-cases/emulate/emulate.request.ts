export type EmulateRequest = {
    hash: string;
    method: string;
    path: string;
    query: Record<string, unknown>;
    headers: Record<string, string | string[] | undefined>;
    body: unknown;
};
