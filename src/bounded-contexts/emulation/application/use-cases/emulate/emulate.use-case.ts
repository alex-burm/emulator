import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
    PROVIDER_REPOSITORY,
    type ProviderRepositoryInterface,
} from '../../../../catalog/domain/repository/provider.repository';
import {
    ENDPOINT_RULE_REPOSITORY,
    type EndpointRuleRepositoryInterface,
} from '../../../../workspace/domain/repositories/endpoint-rule.repository';
import {
    PROJECT_REPOSITORY,
    type ProjectRepositoryInterface,
} from '../../../../workspace/domain/repositories/project.repository';
import { PathMatcherService } from '../../../domain/services/path-matcher.service';
import { ResponseBuilderService } from '../../../domain/services/response-builder.service';
import { RuleEvaluatorService } from '../../../domain/services/rule-evaluator.service';
import { EmulateRequest } from './emulate.request';
import { EmulateResult } from './emulate.result';

@Injectable()
export class EmulateUseCase {
    constructor(
        @Inject(PROJECT_REPOSITORY)
        private readonly projectRepository: ProjectRepositoryInterface,
        @Inject(PROVIDER_REPOSITORY)
        private readonly providerRepository: ProviderRepositoryInterface,
        @Inject(ENDPOINT_RULE_REPOSITORY)
        private readonly endpointRuleRepository: EndpointRuleRepositoryInterface,
        private readonly pathMatcher: PathMatcherService,
        private readonly ruleEvaluator: RuleEvaluatorService,
        private readonly responseBuilder: ResponseBuilderService,
    ) {}

    async execute(request: EmulateRequest): Promise<EmulateResult> {
        const project = await this.projectRepository.findByHash(request.hash);

        if (!project) {
            throw new NotFoundException(
                `Project with hash=${request.hash} not found`,
            );
        }

        const providerEndpoints =
            await this.providerRepository.findEndpointsByProviderId(
                project.providerId,
            );

        const method = request.method.toUpperCase();
        const path = this.normalizePath(request.path);

        let matchedEndpoint: (typeof providerEndpoints)[number] | null = null;
        let pathParams: Record<string, string> = {};

        for (const endpoint of providerEndpoints) {
            if (endpoint.method.toUpperCase() !== method) {
                continue;
            }

            const pathMatch = this.pathMatcher.match(
                endpoint.pathPattern,
                path,
            );

            if (!pathMatch) {
                continue;
            }

            matchedEndpoint = endpoint;
            pathParams = pathMatch.params;
            break;
        }

        if (!matchedEndpoint) {
            throw new NotFoundException(
                `No endpoint matched for ${method} ${path}`,
            );
        }

        const rules =
            await this.endpointRuleRepository.findByProjectAndEndpoint(
                project.id,
                matchedEndpoint.id,
            );

        const matchedRule =
            rules.find((rule) =>
                this.ruleEvaluator.matches(rule, {
                    query: request.query,
                    body: request.body,
                    headers: request.headers,
                    pathParams,
                }),
            ) ?? null;

        if (matchedRule && matchedRule.actionDelayMs > 0) {
            await this.sleep(matchedRule.actionDelayMs);
        }

        const result = this.responseBuilder.build({
            endpoint: matchedEndpoint,
            matchedRule,
        });

        return {
            status: result.status,
            headers: result.headers,
            body: result.body,
        };
    }

    private normalizePath(path: string): string {
        const trimmed = path.trim();

        if (!trimmed) {
            return '/';
        }

        return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    }

    private sleep(delayMs: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, delayMs);
        });
    }
}
