import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ProviderEndpointEntity } from '../../../catalog/domain/entity/provider-endpoint.entity';
import { EndpointRuleEntity } from '../../../workspace/domain/endpoint-rule.entity';

export type EmulationHttpResponse = {
    status: number;
    headers: Record<string, string>;
    body: unknown;
};

export type BuildResponseInput = {
    endpoint: ProviderEndpointEntity;
    matchedRule: EndpointRuleEntity | null;
};

@Injectable()
export class ResponseBuilderService {
    build(input: BuildResponseInput): EmulationHttpResponse {
        const { endpoint, matchedRule } = input;

        const status = matchedRule?.actionStatus ?? endpoint.defaultStatus;
        const bodySource =
            matchedRule?.actionResponse !== null &&
            matchedRule?.actionResponse !== undefined
                ? matchedRule.actionResponse
                : endpoint.defaultResponse;

        const templatedBody = this.applyTemplateTokens(bodySource);
        const body = matchedRule?.actionRandom
            ? this.randomizeValue(templatedBody)
            : templatedBody;

        return {
            status,
            headers: endpoint.defaultHeaders ?? {
                'Content-Type': 'application/json',
            },
            body,
        };
    }

    private applyTemplateTokens(value: unknown): unknown {
        if (typeof value === 'string') {
            return this.replaceTokenString(value);
        }

        if (Array.isArray(value)) {
            return value.map((item) => this.applyTemplateTokens(item));
        }

        if (!value || typeof value !== 'object') {
            return value;
        }

        const next: Record<string, unknown> = {};

        for (const [key, child] of Object.entries(value)) {
            next[key] = this.applyTemplateTokens(child);
        }

        return next;
    }

    private replaceTokenString(source: string): string {
        return source
            .replaceAll('{{uuid}}', randomUUID())
            .replaceAll('{{timestamp}}', new Date().toISOString())
            .replaceAll('{{integer}}', String(this.randomInt(1, 9999)));
    }

    private randomizeValue(value: unknown): unknown {
        if (value === null || value === undefined) {
            return value;
        }

        if (typeof value === 'string') {
            return this.randomString(12);
        }

        if (typeof value === 'number') {
            return this.randomInt(1, 9999);
        }

        if (typeof value === 'boolean') {
            return Math.random() >= 0.5;
        }

        if (Array.isArray(value)) {
            return value.map((item) => this.randomizeValue(item));
        }

        if (typeof value === 'object') {
            const next: Record<string, unknown> = {};

            for (const [key, child] of Object.entries(value)) {
                next[key] = this.randomizeValue(child);
            }

            return next;
        }

        return value;
    }

    private randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private randomString(length: number): string {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let output = '';

        for (let i = 0; i < length; i += 1) {
            output += alphabet[this.randomInt(0, alphabet.length - 1)];
        }

        return output;
    }
}
