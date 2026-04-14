import { EndpointRuleEntity } from '../endpoint-rule.entity';

export const ENDPOINT_RULE_REPOSITORY = Symbol('ENDPOINT_RULE_REPOSITORY');

export type SaveEndpointRuleData = {
    id?: number;
    projectId: number;
    providerEndpointId: number;
    name: string;
    priority: number;
    conditionSource: string;
    conditionKey: string | null;
    conditionOperator: string | null;
    conditionValue: string | null;
    actionDelayMs: number;
    actionStatus: number | null;
    actionResponse: unknown | null;
    actionRandom: boolean;
    isEnabled: boolean;
};

export interface EndpointRuleRepositoryInterface {
    findByProjectId(projectId: number): Promise<EndpointRuleEntity[]>;
    findById(id: number): Promise<EndpointRuleEntity | null>;
    findByProjectAndEndpoint(
        projectId: number,
        providerEndpointId: number,
    ): Promise<EndpointRuleEntity[]>;
    save(data: SaveEndpointRuleData): Promise<EndpointRuleEntity>;
    deleteByProjectAndId(projectId: number, id: number): Promise<boolean>;
}
