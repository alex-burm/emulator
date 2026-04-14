import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
    PROVIDER_REPOSITORY,
    type ProviderRepositoryInterface,
} from '../../../../catalog/domain/repository/provider.repository';
import {
    PROJECT_REPOSITORY,
    type ProjectRepositoryInterface,
} from '../../../domain/repositories/project.repository';
import { ProjectHash } from '../../../domain/value-objects/project-hash.vo';
import { CreateProjectCommand } from './create-project.command';
import { CreateProjectResult } from './create-project.result';

@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler
    implements ICommandHandler<CreateProjectCommand, CreateProjectResult>
{
    constructor(
        @Inject(PROVIDER_REPOSITORY)
        private readonly providerRepository: ProviderRepositoryInterface,
        @Inject(PROJECT_REPOSITORY)
        private readonly projectRepository: ProjectRepositoryInterface,
    ) {}

    async execute(command: CreateProjectCommand): Promise<CreateProjectResult> {
        const providerExists = await this.providerRepository.existsById(
            command.providerId,
        );

        if (!providerExists) {
            throw new NotFoundException(
                `Provider with id=${command.providerId} not found`,
            );
        }

        const hash = await this.generateUniqueHash();

        const project = await this.projectRepository.createAndSave({
            name: command.name,
            hash,
            providerId: command.providerId,
        });

        return {
            id: project.id,
            name: project.name,
            hash: project.hash,
            providerId: project.providerId,
            createdAt: project.createdAt,
        };
    }

    private async generateUniqueHash(): Promise<string> {
        for (let i = 0; i < 10; i += 1) {
            const hash = ProjectHash.generate().toString();
            const existingProject =
                await this.projectRepository.findByHash(hash);

            if (!existingProject) {
                return hash;
            }
        }

        throw new Error('Unable to generate unique project hash');
    }
}
