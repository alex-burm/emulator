import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
    ENDPOINT_RULE_REPOSITORY,
    type EndpointRuleRepositoryInterface,
} from '../../../domain/repositories/endpoint-rule.repository';
import { DeleteEndpointRuleCommand } from './delete-endpoint-rule.command';
import { DeleteEndpointRuleResult } from './delete-endpoint-rule.result';

@CommandHandler(DeleteEndpointRuleCommand)
export class DeleteEndpointRuleHandler
    implements
        ICommandHandler<DeleteEndpointRuleCommand, DeleteEndpointRuleResult>
{
    constructor(
        @Inject(ENDPOINT_RULE_REPOSITORY)
        private readonly endpointRuleRepository: EndpointRuleRepositoryInterface,
    ) {}

    async execute(
        command: DeleteEndpointRuleCommand,
    ): Promise<DeleteEndpointRuleResult> {
        const deleted = await this.endpointRuleRepository.deleteByProjectAndId(
            command.projectId,
            command.ruleId,
        );

        if (!deleted) {
            throw new NotFoundException(
                `Rule with id=${command.ruleId} not found in project id=${command.projectId}`,
            );
        }

        return { deleted: true };
    }
}
