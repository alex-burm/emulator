import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { EndpointRuleEntity } from './endpoint-rule.entity';

@Entity({ name: 'projects' })
export class ProjectEntity {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number;

    @Column({ type: 'varchar', length: 128 })
    name!: string;

    @Index('UQ_projects_hash', { unique: true })
    @Column({ type: 'varchar', length: 12 })
    hash!: string;

    @Column({ name: 'provider_id', type: 'int', unsigned: true })
    providerId!: number;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt!: Date;

    @ManyToOne('ProviderEntity', {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'provider_id' })
    provider!: unknown;

    @OneToMany(() => EndpointRuleEntity, (endpointRule) => endpointRule.project)
    endpointRules!: EndpointRuleEntity[];
}
