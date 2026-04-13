import { ProviderSeed } from './catalog-seed.types';

export const SERVICETITAN_PROVIDER_SEED: ProviderSeed = {
    slug: 'servicetitan',
    name: 'ServiceTitan',
    description: 'ServiceTitan Public API v2 for field service operations.',
    authType: 'oauth2',
    baseUrl: 'https://api.servicetitan.io',
    defaultHeaders: {
        'Content-Type': 'application/json',
    },
    authConfig: {
        tokenUrl: 'https://auth.servicetitan.io/connect/token',
        grantType: 'client_credentials',
        scopes: ['tenant'],
    },
    endpoints: [
        {
            method: 'GET',
            pathPattern: '/v2/tenant/:tenantId/appointments',
            description: 'List appointments',
            defaultStatus: 200,
            defaultResponse: {
                data: [
                    {
                        id: 10001,
                        status: 'Scheduled',
                        jobId: 7001,
                    },
                ],
                hasMore: false,
                totalCount: 1,
            },
        },
        {
            method: 'GET',
            pathPattern: '/v2/tenant/:tenantId/appointments/:id',
            description: 'Get appointment by id',
            defaultStatus: 200,
            defaultResponse: {
                id: 10001,
                status: 'Scheduled',
                durationMinutes: 120,
            },
        },
        {
            method: 'GET',
            pathPattern: '/v2/tenant/:tenantId/jobs',
            description: 'List jobs',
            defaultStatus: 200,
            defaultResponse: {
                data: [
                    {
                        id: 7001,
                        number: 'J-7001',
                        priority: 'Normal',
                    },
                ],
                hasMore: false,
                totalCount: 1,
            },
        },
        {
            method: 'GET',
            pathPattern: '/v2/tenant/:tenantId/jobs/:id',
            description: 'Get job by id',
            defaultStatus: 200,
            defaultResponse: {
                id: 7001,
                number: 'J-7001',
                summary: 'Seasonal HVAC maintenance',
            },
        },
        {
            method: 'GET',
            pathPattern: '/v2/tenant/:tenantId/customers',
            description: 'List customers',
            defaultStatus: 200,
            defaultResponse: {
                data: [
                    {
                        id: 5001,
                        name: 'John Smith',
                        phone: '+1-303-555-0101',
                    },
                ],
                hasMore: false,
                totalCount: 1,
            },
        },
        {
            method: 'GET',
            pathPattern: '/v2/tenant/:tenantId/customers/:id',
            description: 'Get customer by id',
            defaultStatus: 200,
            defaultResponse: {
                id: 5001,
                name: 'John Smith',
                email: 'john.smith@example.com',
            },
        },
        {
            method: 'GET',
            pathPattern: '/v2/tenant/:tenantId/technicians',
            description: 'List technicians',
            defaultStatus: 200,
            defaultResponse: {
                data: [
                    {
                        id: 9001,
                        name: 'Mike Johnson',
                        active: true,
                    },
                ],
                hasMore: false,
                totalCount: 1,
            },
        },
        {
            method: 'GET',
            pathPattern: '/v2/tenant/:tenantId/invoices',
            description: 'List invoices',
            defaultStatus: 200,
            defaultResponse: {
                data: [
                    {
                        id: 3001,
                        number: 'INV-3001',
                        total: 425.5,
                    },
                ],
                hasMore: false,
                totalCount: 1,
            },
        },
        {
            method: 'GET',
            pathPattern: '/v2/tenant/:tenantId/invoices/:id',
            description: 'Get invoice by id',
            defaultStatus: 200,
            defaultResponse: {
                id: 3001,
                number: 'INV-3001',
                total: 425.5,
                balance: 0,
            },
        },
        {
            method: 'POST',
            pathPattern: '/v2/tenant/:tenantId/jobs/:id/cancel',
            description: 'Cancel job',
            defaultStatus: 200,
            defaultResponse: {
                success: true,
                message: 'Job cancelled',
            },
        },
    ],
};
