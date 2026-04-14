import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
    PROJECT_REPOSITORY,
    type ProjectRepositoryInterface,
} from '../../../domain/repositories/project.repository';
import { RenameProjectCommand } from './rename-project.command';
import { RenameProjectResult } from './rename-project.result';

@CommandHandler(RenameProjectCommand)
export class RenameProjectHandler
    implements ICommandHandler<RenameProjectCommand, RenameProjectResult>
{
    constructor(
        @Inject(PROJECT_REPOSITORY)
        private readonly projectRepository: ProjectRepositoryInterface,
    ) {}

    async execute(command: RenameProjectCommand): Promise<RenameProjectResult> {
        const project = await this.projectRepository.updateName(
            command.id,
            command.name,
        );

        if (!project) {
            throw new NotFoundException(
                `Project with id=${command.id} not found`,
            );
        }

        return new RenameProjectResult(project.id, project.name, project.hash);
    }
}
