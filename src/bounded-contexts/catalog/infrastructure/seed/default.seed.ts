import { ProviderSeed } from './catalog-seed.types';

export const DEFAULT_PROVIDER_SEED: ProviderSeed = {
    slug: 'default',
    name: 'Default Provider',
    description: 'Provider with response-format variability examples.',
    authType: 'none',
    baseUrl: 'https://default.local',
    defaultHeaders: {
        'Content-Type': 'application/json',
    },
    authConfig: {},
    endpoints: [
        {
            method: 'GET',
            pathPattern: '/plain/ping',
            description: 'Plain text response example',
            defaultStatus: 200,
            defaultHeaders: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
            defaultResponse: 'pong',
        },
        {
            method: 'GET',
            pathPattern: '/xml/orders/:id',
            description: 'XML response example',
            defaultStatus: 200,
            defaultHeaders: {
                'Content-Type': 'application/xml; charset=utf-8',
            },
            defaultResponse:
                '<?xml version="1.0" encoding="UTF-8"?><order><id>{{integer}}</id><status>ok</status></order>',
        },
        {
            method: 'GET',
            pathPattern: '/html/status',
            description: 'HTML response example',
            defaultStatus: 200,
            defaultHeaders: {
                'Content-Type': 'text/html; charset=utf-8',
            },
            defaultResponse:
                '<!doctype html><html><body><h1>default provider</h1><p>status: ok</p></body></html>',
        },
        {
            method: 'GET',
            pathPattern: '/empty/no-content',
            description: 'Empty body response example',
            defaultStatus: 204,
            defaultHeaders: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
            defaultResponse: null,
        },
        {
            method: 'GET',
            pathPattern: '/timeout/upstream',
            description: 'Timeout-style response example',
            defaultStatus: 504,
            defaultHeaders: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
            defaultResponse: 'Gateway Timeout',
        },
    ],
};
