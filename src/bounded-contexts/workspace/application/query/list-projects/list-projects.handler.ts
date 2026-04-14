import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
    PROJECT_REPOSITORY,
    type ProjectRepositoryInterface,
} from '../../../domain/repositories/project.repository';
import { ListProjectsQuery } from './list-projects.query';
import { ListProjectsResultItem } from './list-projects.result';

@QueryHandler(ListProjectsQuery)
export class ListProjectsHandler
    implements IQueryHandler<ListProjectsQuery, ListProjectsResultItem[]>
{
    constructor(
        @Inject(PROJECT_REPOSITORY)
        private readonly projectRepository: ProjectRepositoryInterface,
    ) {}

    async execute(): Promise<ListProjectsResultItem[]> {
        const projects = await this.projectRepository.findAllWithProvider();

        return projects.map((project) => ({
            id: project.id,
            name: project.name,
            hash: project.hash,
            providerId: project.providerId,
            providerName: project.provider.name,
            createdAt: project.createdAt,
        }));
    }
}
