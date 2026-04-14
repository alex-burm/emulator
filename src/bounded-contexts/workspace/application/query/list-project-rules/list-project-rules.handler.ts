import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
    ENDPOINT_RULE_REPOSITORY,
    type EndpointRuleRepositoryInterface,
} from '../../../domain/repositories/endpoint-rule.repository';
import {
    PROJECT_REPOSITORY,
    type ProjectRepositoryInterface,
} from '../../../domain/repositories/project.repository';
import { ListProjectRulesQuery } from './list-project-rules.query';
import { ListProjectRulesResultItem } from './list-project-rules.result';

@QueryHandler(ListProjectRulesQuery)
export class ListProjectRulesHandler
    implements
        IQueryHandler<ListProjectRulesQuery, ListProjectRulesResultItem[]>
{
    constructor(
        @Inject(PROJECT_REPOSITORY)
        private readonly projectRepository: ProjectRepositoryInterface,
        @Inject(ENDPOINT_RULE_REPOSITORY)
        private readonly endpointRuleRepository: EndpointRuleRepositoryInterface,
    ) {}

    async execute(
        query: ListProjectRulesQuery,
    ): Promise<ListProjectRulesResultItem[]> {
        const project = await this.projectRepository.findById(query.projectId);

        if (!project) {
            throw new NotFoundException(
                `Project with id=${query.projectId} not found`,
            );
        }

        const rules = await this.endpointRuleRepository.findByProjectId(
            query.projectId,
        );

        return rules.map((rule) => ({
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
        }));
    }
}
