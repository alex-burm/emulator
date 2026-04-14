import { Injectable } from '@nestjs/common';
import { EndpointRuleEntity } from '../../../workspace/domain/endpoint-rule.entity';
import { RuleConditionOperator } from '../../../workspace/domain/value-objects/rule-condition-operator.enum';
import { RuleConditionSource } from '../../../workspace/domain/value-objects/rule-condition-source.enum';

export type RuleEvaluationContext = {
    query: Record<string, unknown>;
    body: unknown;
    headers: Record<string, string | string[] | undefined>;
    pathParams: Record<string, string>;
};

@Injectable()
export class RuleEvaluatorService {
    matches(rule: EndpointRuleEntity, context: RuleEvaluationContext): boolean {
        if (!rule.isEnabled) {
            return false;
        }

        if (rule.conditionSource === RuleConditionSource.NONE) {
            return true;
        }

        if (!rule.conditionKey || !rule.conditionOperator) {
            return false;
        }

        const currentValue = this.resolveValue(
            rule.conditionSource,
            rule.conditionKey,
            context,
        );

        switch (rule.conditionOperator) {
            case RuleConditionOperator.EQ:
                return (
                    this.toComparable(currentValue) ===
                    (rule.conditionValue ?? '')
                );
            case RuleConditionOperator.CONTAINS:
                return this.toComparable(currentValue).includes(
                    rule.conditionValue ?? '',
                );
            case RuleConditionOperator.EXISTS:
                return currentValue !== undefined && currentValue !== null;
            case RuleConditionOperator.NOT_EXISTS:
                return currentValue === undefined || currentValue === null;
            case RuleConditionOperator.REGEX:
                return this.matchesRegex(currentValue, rule.conditionValue);
            default:
                return false;
        }
    }

    private resolveValue(
        source: RuleConditionSource,
        key: string,
        context: RuleEvaluationContext,
    ): unknown {
        switch (source) {
            case RuleConditionSource.QUERY_PARAM:
                return this.resolveByPath(context.query, key);
            case RuleConditionSource.BODY_FIELD:
                return this.resolveByPath(context.body, key);
            case RuleConditionSource.HEADER:
                return this.resolveHeader(context.headers, key);
            case RuleConditionSource.PATH_PARAM:
                return context.pathParams[key];
            case RuleConditionSource.NONE:
            default:
                return undefined;
        }
    }

    private resolveByPath(source: unknown, path: string): unknown {
        const parts = path.split('.').filter((part) => part.length > 0);
        let cursor: unknown = source;

        for (const part of parts) {
            if (cursor === null || cursor === undefined) {
                return undefined;
            }

            if (typeof cursor !== 'object') {
                return undefined;
            }

            cursor = (cursor as Record<string, unknown>)[part];
        }

        return cursor;
    }

    private resolveHeader(
        headers: Record<string, string | string[] | undefined>,
        key: string,
    ): string | string[] | undefined {
        return headers[key.toLowerCase()];
    }

    private toComparable(value: unknown): string {
        if (Array.isArray(value)) {
            return value.join(',');
        }

        if (value === null || value === undefined) {
            return '';
        }

        if (typeof value === 'object') {
            try {
                return JSON.stringify(value);
            } catch {
                return '';
            }
        }

        return String(value);
    }

    private matchesRegex(value: unknown, pattern: string | null): boolean {
        if (!pattern) {
            return false;
        }

        try {
            const regex = new RegExp(pattern);
            return regex.test(this.toComparable(value));
        } catch {
            return false;
        }
    }
}
