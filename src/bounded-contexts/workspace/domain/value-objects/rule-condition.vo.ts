import { RuleConditionOperator } from './rule-condition-operator.enum';
import { RuleConditionSource } from './rule-condition-source.enum';

export type RuleConditionPrimitives = {
    source: RuleConditionSource;
    key: string | null;
    operator: RuleConditionOperator | null;
    value: string | null;
};

export class RuleCondition {
    private constructor(private readonly data: RuleConditionPrimitives) {}

    static fromPrimitives(data: RuleConditionPrimitives): RuleCondition {
        RuleCondition.validate(data);
        return new RuleCondition(data);
    }

    toPrimitives(): RuleConditionPrimitives {
        return this.data;
    }

    private static validate(data: RuleConditionPrimitives): void {
        if (data.source === RuleConditionSource.NONE) {
            if (
                data.key !== null ||
                data.operator !== null ||
                data.value !== null
            ) {
                throw new Error(
                    'When source is none, key/operator/value must be null',
                );
            }

            return;
        }

        if (!data.key || data.key.trim().length === 0) {
            throw new Error('Condition key is required for non-none source');
        }

        if (!data.operator) {
            throw new Error(
                'Condition operator is required for non-none source',
            );
        }

        if (
            data.operator === RuleConditionOperator.EXISTS ||
            data.operator === RuleConditionOperator.NOT_EXISTS
        ) {
            if (data.value !== null) {
                throw new Error(
                    'Condition value must be null for exists/not_exists operators',
                );
            }

            return;
        }

        if (data.value === null) {
            throw new Error(
                'Condition value is required for selected operator',
            );
        }
    }
}
