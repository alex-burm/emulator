import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
    PROVIDER_REPOSITORY,
    type ProviderRepositoryInterface,
} from '../../../../catalog/domain/repository/provider.repository';
import {
    ENDPOINT_RULE_REPOSITORY,
    type EndpointRuleRepositoryInterface,
} from '../../../domain/repositories/endpoint-rule.repository';
import {
    PROJECT_REPOSITORY,
    type ProjectRepositoryInterface,
} from '../../../domain/repositories/project.repository';
import { GetProjectDetailQuery } from './get-project-detail.query';
import {
    GetProjectDetailResult,
    ProjectDetailRuleResult,
} from './get-project-detail.result';

@QueryHandler(GetProjectDetailQuery)
export class GetProjectDetailHandler
    implements IQueryHandler<GetProjectDetailQuery, GetProjectDetailResult>
{
    constructor(
        @Inject(PROJECT_REPOSITORY)
        private readonly projectRepository: ProjectRepositoryInterface,
        @Inject(PROVIDER_REPOSITORY)
        private readonly providerRepository: ProviderRepositoryInterface,
        @Inject(ENDPOINT_RULE_REPOSITORY)
        private readonly endpointRuleRepository: EndpointRuleRepositoryInterface,
    ) {}

    async execute(
        query: GetProjectDetailQuery,
    ): Promise<GetProjectDetailResult> {
        const project = await this.projectRepository.findByIdWithProvider(
            query.projectId,
        );

        if (!project) {
            throw new NotFoundException(
                `Project with id=${query.projectId} not found`,
            );
        }

        const providerEndpoints =
            await this.providerRepository.findEndpointsByProviderId(
                project.providerId,
            );
        const rules = await this.endpointRuleRepository.findByProjectId(
            project.id,
        );

        const rulesByEndpointId = new Map<number, ProjectDetailRuleResult[]>();

        for (const rule of rules) {
            const ruleItem: ProjectDetailRuleResult = {
                id: rule.id,
                projectId: rule.projectId,
                providerEndpointId: rule.providerEndpointId,
                name: rule.name,
                priority: rule.priority,
                conditionSource: rule.conditionSource,
                conditionKey: rule.conditionKey,
                conditionOperator: rule.conditionOperator,
                conditionValue: rule.conditionValue,
                actionDelayMs: rule.actionDelayMs,
                actionStatus: rule.actionStatus,
                actionResponse: rule.actionResponse,
                actionRandom: rule.actionRandom,
                isEnabled: rule.isEnabled,
                createdAt: rule.createdAt,
            };

            if (!rulesByEndpointId.has(rule.providerEndpointId)) {
                rulesByEndpointId.set(rule.providerEndpointId, []);
            }

            rulesByEndpointId.get(rule.providerEndpointId)?.push(ruleItem);
        }

        return {
            id: project.id,
            name: project.name,
            hash: project.hash,
            providerId: project.providerId,
            providerName: project.provider.name,
            createdAt: project.createdAt,
            endpoints: providerEndpoints.map((endpoint) => ({
                id: endpoint.id,
                method: endpoint.method,
                pathPattern: endpoint.pathPattern,
                description: endpoint.description,
                defaultStatus: endpoint.defaultStatus,
                defaultResponse: endpoint.defaultResponse,
                defaultHeaders: endpoint.defaultHeaders,
                rules: rulesByEndpointId.get(endpoint.id) ?? [],
            })),
        };
    }
}
