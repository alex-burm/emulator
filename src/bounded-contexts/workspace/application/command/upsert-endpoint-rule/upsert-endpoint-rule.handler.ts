import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
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
import { RuleCondition } from '../../../domain/value-objects/rule-condition.vo';
import { UpsertEndpointRuleCommand } from './upsert-endpoint-rule.command';
import { UpsertEndpointRuleResult } from './upsert-endpoint-rule.result';

@CommandHandler(UpsertEndpointRuleCommand)
export class UpsertEndpointRuleHandler
    implements
        ICommandHandler<UpsertEndpointRuleCommand, UpsertEndpointRuleResult>
{
    constructor(
        @Inject(PROJECT_REPOSITORY)
        private readonly projectRepository: ProjectRepositoryInterface,
        @Inject(ENDPOINT_RULE_REPOSITORY)
        private readonly endpointRuleRepository: EndpointRuleRepositoryInterface,
        @Inject(PROVIDER_REPOSITORY)
        private readonly providerRepository: ProviderRepositoryInterface,
    ) {}

    async execute(
        command: UpsertEndpointRuleCommand,
    ): Promise<UpsertEndpointRuleResult> {
        const project = await this.projectRepository.findById(
            command.projectId,
        );

        if (!project) {
            throw new NotFoundException(
                `Project with id=${command.projectId} not found`,
            );
        }

        const providerEndpoint = await this.providerRepository.findEndpointById(
            command.input.providerEndpointId,
        );

        if (!providerEndpoint) {
            throw new NotFoundException(
                `Provider endpoint with id=${command.input.providerEndpointId} not found`,
            );
        }

        if (providerEndpoint.providerId !== project.providerId) {
            throw new BadRequestException(
                'Provider endpoint does not belong to project provider',
            );
        }

        if (command.ruleId) {
            const existingRule = await this.endpointRuleRepository.findById(
                command.ruleId,
            );

            if (!existingRule || existingRule.projectId !== command.projectId) {
                throw new NotFoundException(
                    `Rule with id=${command.ruleId} not found in project id=${command.projectId}`,
                );
            }
        }

        const condition = RuleCondition.fromPrimitives({
            source: command.input.conditionSource,
            key: command.input.conditionKey,
            operator: command.input.conditionOperator,
            value: command.input.conditionValue,
        });

        const conditionPrimitives = condition.toPrimitives();

        const savedRule = await this.endpointRuleRepository.save({
            id: command.ruleId,
            projectId: command.projectId,
            providerEndpointId: command.input.providerEndpointId,
            name: command.input.name,
            priority: command.input.priority,
            conditionSource: conditionPrimitives.source,
            conditionKey: conditionPrimitives.key,
            conditionOperator: conditionPrimitives.operator,
            conditionValue: conditionPrimitives.value,
            actionDelayMs: command.input.actionDelayMs,
            actionStatus: command.input.actionStatus,
            actionResponse: command.input.actionResponse,
            actionRandom: command.input.actionRandom,
            isEnabled: command.input.isEnabled,
        });

        return {
            id: savedRule.id,
            projectId: savedRule.projectId,
            providerEndpointId: savedRule.providerEndpointId,
            name: savedRule.name,
            priority: savedRule.priority,
            conditionSource: savedRule.conditionSource,
            conditionKey: savedRule.conditionKey,
            conditionOperator: savedRule.conditionOperator,
            conditionValue: savedRule.conditionValue,
            actionDelayMs: savedRule.actionDelayMs,
            actionStatus: savedRule.actionStatus,
            actionResponse: savedRule.actionResponse,
            actionRandom: savedRule.actionRandom,
            isEnabled: savedRule.isEnabled,
            createdAt: savedRule.createdAt,
        };
    }
}
