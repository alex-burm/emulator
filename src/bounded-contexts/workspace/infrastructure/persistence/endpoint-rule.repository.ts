import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EndpointRuleEntity } from '../../domain/endpoint-rule.entity';
import {
    EndpointRuleRepositoryInterface,
    SaveEndpointRuleData,
} from '../../domain/repositories/endpoint-rule.repository';

@Injectable()
export class TypeOrmEndpointRuleRepository
    implements EndpointRuleRepositoryInterface
{
    constructor(
        @InjectRepository(EndpointRuleEntity)
        private readonly endpointRuleRepository: Repository<EndpointRuleEntity>,
    ) {}

    async findByProjectId(projectId: number): Promise<EndpointRuleEntity[]> {
        return this.endpointRuleRepository.find({
            where: { projectId },
            order: { priority: 'ASC', id: 'ASC' },
        });
    }

    async findById(id: number): Promise<EndpointRuleEntity | null> {
        return this.endpointRuleRepository.findOne({ where: { id } });
    }

    async findByProjectAndEndpoint(
        projectId: number,
        providerEndpointId: number,
    ): Promise<EndpointRuleEntity[]> {
        return this.endpointRuleRepository.find({
            where: { projectId, providerEndpointId },
            order: { priority: 'ASC', id: 'ASC' },
        });
    }

    async save(data: SaveEndpointRuleData): Promise<EndpointRuleEntity> {
        const entity = this.endpointRuleRepository.create({
            ...data,
            conditionSource:
                data.conditionSource as EndpointRuleEntity['conditionSource'],
            conditionOperator:
                data.conditionOperator as EndpointRuleEntity['conditionOperator'],
        });

        return this.endpointRuleRepository.save(entity);
    }

    async deleteByProjectAndId(
        projectId: number,
        id: number,
    ): Promise<boolean> {
        const result = await this.endpointRuleRepository.delete({
            id,
            projectId,
        });
        return (result.affected ?? 0) > 0;
    }
}
