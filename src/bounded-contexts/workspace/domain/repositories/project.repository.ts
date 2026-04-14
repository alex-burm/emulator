import { ProjectEntity } from '../project.entity';

export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');

export type CreateProjectData = {
    name: string;
    hash: string;
    providerId: number;
};

export interface ProjectRepositoryInterface {
    findAll(): Promise<ProjectEntity[]>;
    findAllWithProvider(): Promise<ProjectEntity[]>;
    findById(id: number): Promise<ProjectEntity | null>;
    findByIdWithProvider(id: number): Promise<ProjectEntity | null>;
    findByHash(hash: string): Promise<ProjectEntity | null>;
    createAndSave(data: CreateProjectData): Promise<ProjectEntity>;
    deleteById(id: number): Promise<boolean>;
}
