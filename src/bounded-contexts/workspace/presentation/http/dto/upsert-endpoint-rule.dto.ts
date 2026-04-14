import {
    IsBoolean,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';
import { RuleConditionOperator } from '../../../domain/value-objects/rule-condition-operator.enum';
import { RuleConditionSource } from '../../../domain/value-objects/rule-condition-source.enum';

export class UpsertEndpointRuleDto {
    @IsInt()
    @Min(1)
    providerEndpointId!: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    name!: string;

    @IsInt()
    @Min(1)
    priority!: number;

    @IsString()
    @IsIn(Object.values(RuleConditionSource))
    conditionSource!: RuleConditionSource;

    @IsOptional()
    @IsString()
    @MaxLength(128)
    conditionKey!: string | null;

    @IsOptional()
    @IsString()
    @IsIn(Object.values(RuleConditionOperator))
    conditionOperator!: RuleConditionOperator | null;

    @IsOptional()
    @IsString()
    @MaxLength(512)
    conditionValue!: string | null;

    @IsInt()
    @Min(0)
    actionDelayMs!: number;

    @IsOptional()
    @IsInt()
    @Min(100)
    actionStatus!: number | null;

    @IsOptional()
    actionResponse!: unknown | null;

    @IsBoolean()
    actionRandom!: boolean;

    @IsBoolean()
    isEnabled!: boolean;
}
