import { NotFoundException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
    PROJECT_REPOSITORY,
    type ProjectRepositoryInterface,
} from '../../../domain/repositories/project.repository';
import { DeleteProjectCommand } from './delete-project.command';
import { DeleteProjectResult } from './delete-project.result';

@CommandHandler(DeleteProjectCommand)
export class DeleteProjectHandler
    implements ICommandHandler<DeleteProjectCommand, DeleteProjectResult>
{
    constructor(
        @Inject(PROJECT_REPOSITORY)
        private readonly projectRepository: ProjectRepositoryInterface,
    ) {}

    async execute(command: DeleteProjectCommand): Promise<DeleteProjectResult> {
        const deleted = await this.projectRepository.deleteById(
            command.projectId,
        );

        if (!deleted) {
            throw new NotFoundException(
                `Project with id=${command.projectId} not found`,
            );
        }

        return { deleted: true };
    }
}
