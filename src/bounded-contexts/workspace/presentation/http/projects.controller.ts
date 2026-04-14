import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateProjectCommand } from '../../application/command/create-project/create-project.command';
import { CreateProjectResult } from '../../application/command/create-project/create-project.result';
import { DeleteProjectCommand } from '../../application/command/delete-project/delete-project.command';
import { DeleteProjectResult } from '../../application/command/delete-project/delete-project.result';
import { GetProjectDetailQuery } from '../../application/query/get-project-detail/get-project-detail.query';
import { GetProjectDetailResult } from '../../application/query/get-project-detail/get-project-detail.result';
import { ListProjectsQuery } from '../../application/query/list-projects/list-projects.query';
import { ListProjectsResultItem } from '../../application/query/list-projects/list-projects.result';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('projects')
export class ProjectsController {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) {}

    @Get()
    async listProjects(): Promise<ListProjectsResultItem[]> {
        return this.queryBus.execute<
            ListProjectsQuery,
            ListProjectsResultItem[]
        >(new ListProjectsQuery());
    }

    @Post()
    async createProject(
        @Body() body: CreateProjectDto,
    ): Promise<CreateProjectResult> {
        return this.commandBus.execute<
            CreateProjectCommand,
            CreateProjectResult
        >(new CreateProjectCommand(body.name, body.providerId));
    }

    @Get(':id')
    async getProjectDetail(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<GetProjectDetailResult> {
        return this.queryBus.execute<
            GetProjectDetailQuery,
            GetProjectDetailResult
        >(new GetProjectDetailQuery(id));
    }

    @Delete(':id')
    async deleteProject(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<DeleteProjectResult> {
        return this.commandBus.execute<
            DeleteProjectCommand,
            DeleteProjectResult
        >(new DeleteProjectCommand(id));
    }
}
