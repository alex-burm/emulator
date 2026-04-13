import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ProviderEndpointEntity } from './provider-endpoint.entity';

@Entity({ name: 'providers' })
export class ProviderEntity {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number;

    @Column({ type: 'varchar', length: 64, unique: true })
    slug!: string;

    @Column({ type: 'varchar', length: 128 })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ name: 'auth_type', type: 'varchar', length: 32 })
    authType!: string;

    @Column({ name: 'base_url', type: 'varchar', length: 255, nullable: true })
    baseUrl!: string | null;

    @Column({ name: 'default_headers', type: 'json', nullable: true })
    defaultHeaders!: Record<string, string> | null;

    @Column({ name: 'auth_config', type: 'json', nullable: true })
    authConfig!: Record<string, unknown> | null;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt!: Date;

    @OneToMany(
        () => ProviderEndpointEntity,
        (providerEndpoint) => providerEndpoint.provider,
    )
    endpoints!: ProviderEndpointEntity[];
}
