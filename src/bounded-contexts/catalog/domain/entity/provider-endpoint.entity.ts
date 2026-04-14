import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ProviderEntity } from './provider.entity';

@Entity({ name: 'provider_endpoints' })
@Index('IDX_provider_endpoints_provider_id', ['providerId'])
export class ProviderEndpointEntity {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number;

    @Column({ name: 'provider_id', type: 'int', unsigned: true })
    providerId!: number;

    @Column({ type: 'varchar', length: 8 })
    method!: string;

    @Column({ name: 'path_pattern', type: 'varchar', length: 512 })
    pathPattern!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    description!: string | null;

    @Column({
        name: 'default_status',
        type: 'int',
        unsigned: true,
        default: 200,
    })
    defaultStatus!: number;

    @Column({ name: 'default_response', type: 'json', nullable: true })
    defaultResponse!: unknown | null;

    @Column({ name: 'default_headers', type: 'json', nullable: true })
    defaultHeaders!: Record<string, string> | null;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt!: Date;

    @ManyToOne(() => ProviderEntity, (provider) => provider.endpoints, {
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'provider_id' })
    provider!: ProviderEntity;
}
