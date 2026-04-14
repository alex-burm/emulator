import { RuleConditionOperator } from '../../../domain/value-objects/rule-condition-operator.enum';
import { RuleConditionSource } from '../../../domain/value-objects/rule-condition-source.enum';

export type UpsertEndpointRuleInput = {
    providerEndpointId: number;
    name: string;
    priority: number;
    conditionSource: RuleConditionSource;
    conditionKey: string | null;
    conditionOperator: RuleConditionOperator | null;
    conditionValue: string | null;
    actionDelayMs: number;
    actionStatus: number | null;
    actionResponse: unknown | null;
    actionRandom: boolean;
    isEnabled: boolean;
};

export class UpsertEndpointRuleCommand {
    constructor(
        public readonly projectId: number,
        public readonly input: UpsertEndpointRuleInput,
        public readonly ruleId?: number,
    ) {}
}
