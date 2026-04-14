import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    CreateProjectData,
    ProjectRepositoryInterface,
} from '../../domain/repositories/project.repository';
import { ProjectEntity } from '../../domain/project.entity';

@Injectable()
export class TypeOrmProjectRepository implements ProjectRepositoryInterface {
    constructor(
        @InjectRepository(ProjectEntity)
        private readonly projectRepository: Repository<ProjectEntity>,
    ) {}

    async findAll(): Promise<ProjectEntity[]> {
        return this.projectRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findAllWithProvider(): Promise<ProjectEntity[]> {
        return this.projectRepository.find({
            relations: {
                provider: true,
            },
            order: { createdAt: 'DESC' },
        });
    }

    async findById(id: number): Promise<ProjectEntity | null> {
        return this.projectRepository.findOne({ where: { id } });
    }

    async findByIdWithProvider(id: number): Promise<ProjectEntity | null> {
        return this.projectRepository.findOne({
            where: { id },
            relations: {
                provider: true,
            },
        });
    }

    async findByHash(hash: string): Promise<ProjectEntity | null> {
        return this.projectRepository.findOne({ where: { hash } });
    }

    async createAndSave(data: CreateProjectData): Promise<ProjectEntity> {
        const entity = this.projectRepository.create(data);
        return this.projectRepository.save(entity);
    }

    async updateName(id: number, name: string): Promise<ProjectEntity | null> {
        await this.projectRepository.update({ id }, { name });
        return this.findByIdWithProvider(id);
    }

    async deleteById(id: number): Promise<boolean> {
        const result = await this.projectRepository.delete({ id });
        return (result.affected ?? 0) > 0;
    }
}
