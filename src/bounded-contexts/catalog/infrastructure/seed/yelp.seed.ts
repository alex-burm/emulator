import { ProviderSeed } from './catalog-seed.types';

export const YELP_PROVIDER_SEED: ProviderSeed = {
    slug: 'yelp',
    name: 'Yelp Fusion',
    description: 'Yelp Fusion API for business and reviews data.',
    authType: 'bearer',
    baseUrl: 'https://api.yelp.com',
    defaultHeaders: {
        'Content-Type': 'application/json',
    },
    authConfig: {
        header: 'Authorization',
        tokenPrefix: 'Bearer',
    },
    endpoints: [
        {
            method: 'GET',
            pathPattern: '/v3/businesses/search',
            description: 'Search businesses',
            defaultStatus: 200,
            defaultResponse: {
                businesses: [
                    {
                        id: 'sushi-place-nyc',
                        name: 'Sushi Place',
                        rating: 4.5,
                    },
                ],
                total: 1,
                region: {
                    center: {
                        latitude: 40.7128,
                        longitude: -74.006,
                    },
                },
            },
        },
        {
            method: 'GET',
            pathPattern: '/v3/businesses/:id',
            description: 'Get business details',
            defaultStatus: 200,
            defaultResponse: {
                id: 'sushi-place-nyc',
                name: 'Sushi Place',
                phone: '+12125550123',
                review_count: 128,
            },
        },
        {
            method: 'GET',
            pathPattern: '/v3/businesses/:id/reviews',
            description: 'Get business reviews',
            defaultStatus: 200,
            defaultResponse: {
                reviews: [
                    {
                        id: 'review-1',
                        rating: 5,
                        text: 'Great service and quality.',
                    },
                ],
                total: 1,
            },
        },
        {
            method: 'GET',
            pathPattern: '/v3/autocomplete',
            description: 'Autocomplete terms',
            defaultStatus: 200,
            defaultResponse: {
                terms: [
                    {
                        text: 'pizza',
                    },
                ],
                businesses: [],
                categories: [],
            },
        },
        {
            method: 'GET',
            pathPattern: '/v3/categories',
            description: 'List categories',
            defaultStatus: 200,
            defaultResponse: {
                categories: [
                    {
                        alias: 'restaurants',
                        title: 'Restaurants',
                    },
                ],
            },
        },
    ],
};
