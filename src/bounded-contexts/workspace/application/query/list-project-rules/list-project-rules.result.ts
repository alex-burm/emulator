import { RuleConditionOperator } from '../../../domain/value-objects/rule-condition-operator.enum';
import { RuleConditionSource } from '../../../domain/value-objects/rule-condition-source.enum';

export type ListProjectRulesResultItem = {
    id: number;
    projectId: number;
    providerEndpointId: number;
    name: string;
    priority: number;
    conditionSource: RuleConditionSource;
    conditionKey: string | null;
    conditionOperator: RuleConditionOperator | null;
    conditionValue: string | null;
    actionDelayMs: number;
    actionStatus: number | null;
    actionResponse: Record<string, unknown> | null;
    actionRandom: boolean;
    isEnabled: boolean;
    createdAt: Date;
};
