import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { WorkspaceModule } from '../workspace/workspace.module';
import { EmulateUseCase } from './application/use-cases/emulate/emulate.use-case';
import { PathMatcherService } from './domain/services/path-matcher.service';
import { ResponseBuilderService } from './domain/services/response-builder.service';
import { RuleEvaluatorService } from './domain/services/rule-evaluator.service';
import { EmulationController } from './presentation/http/emulation.controller';

@Module({
    imports: [CatalogModule, WorkspaceModule],
    controllers: [EmulationController],
    providers: [
        PathMatcherService,
        RuleEvaluatorService,
        ResponseBuilderService,
        EmulateUseCase,
    ],
})
export class EmulationModule {}
