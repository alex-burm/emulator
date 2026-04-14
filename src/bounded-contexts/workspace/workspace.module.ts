import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogModule } from '../catalog/catalog.module';
import { CreateProjectHandler } from './application/command/create-project/create-project.handler';
import { DeleteEndpointRuleHandler } from './application/command/delete-endpoint-rule/delete-endpoint-rule.handler';
import { DeleteProjectHandler } from './application/command/delete-project/delete-project.handler';
import { UpsertEndpointRuleHandler } from './application/command/upsert-endpoint-rule/upsert-endpoint-rule.handler';
import { GetProjectDetailHandler } from './application/query/get-project-detail/get-project-detail.handler';
import { ListProjectRulesHandler } from './application/query/list-project-rules/list-project-rules.handler';
import { ListProjectsHandler } from './application/query/list-projects/list-projects.handler';
import { EndpointRuleEntity } from './domain/endpoint-rule.entity';
import { ENDPOINT_RULE_REPOSITORY } from './domain/repositories/endpoint-rule.repository';
import { PROJECT_REPOSITORY } from './domain/repositories/project.repository';
import { ProjectEntity } from './domain/project.entity';
import { TypeOrmEndpointRuleRepository } from './infrastructure/persistence/endpoint-rule.repository';
import { TypeOrmProjectRepository } from './infrastructure/persistence/project.repository';
import { EndpointRulesController } from './presentation/http/endpoint-rules.controller';
import { ProjectsController } from './presentation/http/projects.controller';

const commandHandlers = [
    CreateProjectHandler,
    DeleteProjectHandler,
    UpsertEndpointRuleHandler,
    DeleteEndpointRuleHandler,
];

const queryHandlers = [
    ListProjectsHandler,
    GetProjectDetailHandler,
    ListProjectRulesHandler,
];

@Module({
    imports: [
        CqrsModule,
        CatalogModule,
        TypeOrmModule.forFeature([ProjectEntity, EndpointRuleEntity]),
    ],
    controllers: [ProjectsController, EndpointRulesController],
    providers: [
        TypeOrmProjectRepository,
        {
            provide: PROJECT_REPOSITORY,
            useExisting: TypeOrmProjectRepository,
        },
        TypeOrmEndpointRuleRepository,
        {
            provide: ENDPOINT_RULE_REPOSITORY,
            useExisting: TypeOrmEndpointRuleRepository,
        },
        ...commandHandlers,
        ...queryHandlers,
    ],
    exports: [PROJECT_REPOSITORY, ENDPOINT_RULE_REPOSITORY],
})
export class WorkspaceModule {}
