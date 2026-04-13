import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ProjectEntity } from './project.entity';

export enum RuleConditionSource {
    NONE = 'none',
    QUERY_PARAM = 'query_param',
    BODY_FIELD = 'body_field',
    HEADER = 'header',
    PATH_PARAM = 'path_param',
}

export enum RuleConditionOperator {
    EQ = 'eq',
    CONTAINS = 'contains',
    EXISTS = 'exists',
    NOT_EXISTS = 'not_exists',
    REGEX = 'regex',
}

@Entity({ name: 'endpoint_rules' })
@Index('IDX_endpoint_rules_project_endpoint_priority', [
    'projectId',
    'providerEndpointId',
    'priority',
])
export class EndpointRuleEntity {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number;

    @Column({ name: 'project_id', type: 'int', unsigned: true })
    projectId!: number;

    @Column({ name: 'provider_endpoint_id', type: 'int', unsigned: true })
    providerEndpointId!: number;

    @Column({ type: 'varchar', length: 128 })
    name!: string;

    @Column({ type: 'int', unsigned: true })
    priority!: number;

    @Column({
        name: 'condition_source',
        type: 'enum',
        enum: RuleConditionSource,
        default: RuleConditionSource.NONE,
    })
    conditionSource!: RuleConditionSource;

    @Column({
        name: 'condition_key',
        type: 'varchar',
        length: 128,
        nullable: true,
    })
    conditionKey!: string | null;

    @Column({
        name: 'condition_operator',
        type: 'enum',
        enum: RuleConditionOperator,
        nullable: true,
    })
    conditionOperator!: RuleConditionOperator | null;

    @Column({
        name: 'condition_value',
        type: 'varchar',
        length: 512,
        nullable: true,
    })
    conditionValue!: string | null;

    @Column({
        name: 'action_delay_ms',
        type: 'int',
        unsigned: true,
        default: 0,
    })
    actionDelayMs!: number;

    @Column({
        name: 'action_status',
        type: 'int',
        unsigned: true,
        nullable: true,
    })
    actionStatus!: number | null;

    @Column({ name: 'action_response', type: 'json', nullable: true })
    actionResponse!: Record<string, unknown> | null;

    @Column({ name: 'action_random', type: 'boolean', default: false })
    actionRandom!: boolean;

    @Column({ name: 'is_enabled', type: 'boolean', default: true })
    isEnabled!: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt!: Date;

    @ManyToOne(() => ProjectEntity, (project) => project.endpointRules, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'project_id' })
    project!: ProjectEntity;

    @ManyToOne('ProviderEndpointEntity', {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'provider_endpoint_id' })
    providerEndpoint!: unknown;
}
