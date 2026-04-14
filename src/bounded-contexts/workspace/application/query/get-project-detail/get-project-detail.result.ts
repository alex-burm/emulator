import { RuleConditionOperator } from '../../../domain/value-objects/rule-condition-operator.enum';
import { RuleConditionSource } from '../../../domain/value-objects/rule-condition-source.enum';

export type ProjectDetailRuleResult = {
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
    actionResponse: unknown | null;
    actionRandom: boolean;
    isEnabled: boolean;
    createdAt: Date;
};

export type ProjectDetailEndpointResult = {
    id: number;
    method: string;
    pathPattern: string;
    description: string | null;
    defaultStatus: number;
    defaultResponse: unknown | null;
    defaultHeaders: Record<string, string> | null;
    rules: ProjectDetailRuleResult[];
};

export type GetProjectDetailResult = {
    id: number;
    name: string;
    hash: string;
    providerId: number;
    providerName: string;
    createdAt: Date;
    endpoints: ProjectDetailEndpointResult[];
};
