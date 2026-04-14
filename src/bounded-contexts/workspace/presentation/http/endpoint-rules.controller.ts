import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DeleteEndpointRuleCommand } from '../../application/command/delete-endpoint-rule/delete-endpoint-rule.command';
import { DeleteEndpointRuleResult } from '../../application/command/delete-endpoint-rule/delete-endpoint-rule.result';
import { UpsertEndpointRuleCommand } from '../../application/command/upsert-endpoint-rule/upsert-endpoint-rule.command';
import { UpsertEndpointRuleResult } from '../../application/command/upsert-endpoint-rule/upsert-endpoint-rule.result';
import { ListProjectRulesQuery } from '../../application/query/list-project-rules/list-project-rules.query';
import { ListProjectRulesResultItem } from '../../application/query/list-project-rules/list-project-rules.result';
import { UpsertEndpointRuleDto } from './dto/upsert-endpoint-rule.dto';

@Controller('projects/:id/rules')
export class EndpointRulesController {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) {}

    @Get()
    async listRules(
        @Param('id', ParseIntPipe) projectId: number,
    ): Promise<ListProjectRulesResultItem[]> {
        return this.queryBus.execute<
            ListProjectRulesQuery,
            ListProjectRulesResultItem[]
        >(new ListProjectRulesQuery(projectId));
    }

    @Post()
    async createRule(
        @Param('id', ParseIntPipe) projectId: number,
        @Body() body: UpsertEndpointRuleDto,
    ): Promise<UpsertEndpointRuleResult> {
        return this.commandBus.execute<
            UpsertEndpointRuleCommand,
            UpsertEndpointRuleResult
        >(
            new UpsertEndpointRuleCommand(projectId, {
                providerEndpointId: body.providerEndpointId,
                name: body.name,
                priority: body.priority,
                conditionSource: body.conditionSource,
                conditionKey: body.conditionKey,
                conditionOperator: body.conditionOperator,
                conditionValue: body.conditionValue,
                actionDelayMs: body.actionDelayMs,
                actionStatus: body.actionStatus,
                actionResponse: body.actionResponse,
                actionRandom: body.actionRandom,
                isEnabled: body.isEnabled,
            }),
        );
    }

    @Put(':ruleId')
    async updateRule(
        @Param('id', ParseIntPipe) projectId: number,
        @Param('ruleId', ParseIntPipe) ruleId: number,
        @Body() body: UpsertEndpointRuleDto,
    ): Promise<UpsertEndpointRuleResult> {
        return this.commandBus.execute<
            UpsertEndpointRuleCommand,
            UpsertEndpointRuleResult
        >(
            new UpsertEndpointRuleCommand(
                projectId,
                {
                    providerEndpointId: body.providerEndpointId,
                    name: body.name,
                    priority: body.priority,
                    conditionSource: body.conditionSource,
                    conditionKey: body.conditionKey,
                    conditionOperator: body.conditionOperator,
                    conditionValue: body.conditionValue,
                    actionDelayMs: body.actionDelayMs,
                    actionStatus: body.actionStatus,
                    actionResponse: body.actionResponse,
                    actionRandom: body.actionRandom,
                    isEnabled: body.isEnabled,
                },
                ruleId,
            ),
        );
    }

    @Delete(':ruleId')
    async deleteRule(
        @Param('id', ParseIntPipe) projectId: number,
        @Param('ruleId', ParseIntPipe) ruleId: number,
    ): Promise<DeleteEndpointRuleResult> {
        return this.commandBus.execute<
            DeleteEndpointRuleCommand,
            DeleteEndpointRuleResult
        >(new DeleteEndpointRuleCommand(projectId, ruleId));
    }
}
