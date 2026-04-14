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
            method: 'POST',
            pathPattern: '/connect/token',
            description: 'OAuth2 token endpoint',
            defaultStatus: 200,
            defaultResponse: {
                access_token: '{{uuid}}',
                expires_in: 3600,
                token_type: 'Bearer',
            },
            defaultHeaders: {
                'Content-Type': 'application/json',
            },
        },
        {
            method: 'GET',
            pathPattern: '/settings/v2/tenant/:tenantId/employees',
            description: 'List tenant employees',
            defaultStatus: 200,
            defaultResponse: {
                page: 1,
                pageSize: 1,
                hasMore: false,
                totalCount: 1,
                data: [
                    {
                        id: 9101,
                        userId: 8101,
                        name: 'Mike Johnson',
                        firstName: 'Mike',
                        lastName: 'Johnson',
                        managerId: 9001,
                        role: {
                            id: 301,
                            name: 'Technician',
                        },
                        roleIds: [301],
                        businessUnitId: 110,
                        createdOn: '2025-01-10T09:00:00Z',
                        modifiedOn: '2026-01-10T09:00:00Z',
                        email: 'mike.johnson@example.com',
                        phoneNumber: '+1-303-555-0109',
                        loginName: 'mjohnson',
                        active: true,
                        aadUserId: 'aad-user-9101',
                        accountLocked: false,
                        home: {
                            street: '100 Main St',
                            unit: 'Apt 5',
                            country: 'US',
                            city: 'Denver',
                            state: 'CO',
                            zip: '80202',
                        },
                        agentId: 1201,
                        startDate: '2024-01-15',
                        terminationDate: null,
                        hourlyRate: 42.5,
                        overtimeProfileId: 77,
                        customFields: [
                            {
                                typeId: 1,
                                name: 'ShirtSize',
                                value: 'L',
                            },
                        ],
                        permissions: [
                            {
                                id: 5001,
                                value: 'Dispatch.View',
                            },
                        ],
                    },
                ],
            },
        },
        {
            method: 'GET',
            pathPattern: '/v2/tenant/:tenantId/appointments',
            description: 'List appointments',
            defaultStatus: 200,
            defaultResponse: {
                page: 1,
                pageSize: 1,
                hasMore: false,
                totalCount: 1,
                data: [
                    {
                        id: 10001,
                        jobId: 7001,
                        appointmentNumber: 'A-10001',
                        start: '2026-04-14T09:00:00Z',
                        end: '2026-04-14T11:00:00Z',
                        arrivalWindowStart: '2026-04-14T08:30:00Z',
                        arrivalWindowEnd: '2026-04-14T10:00:00Z',
                        status: {
                            id: 'scheduled',
                            name: 'Scheduled',
                        },
                        specialInstructions: 'Call before arrival',
                        createdOn: '2026-04-10T12:00:00Z',
                        modifiedOn: '2026-04-12T16:30:00Z',
                        customerId: 5001,
                        unused: false,
                        createdById: 21,
                        isConfirmed: true,
                        active: true,
                    },
                ],
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
