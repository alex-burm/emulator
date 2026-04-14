import { All, Controller, Param, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { EmulateUseCase } from '../../application/use-cases/emulate/emulate.use-case';

@Controller('emulate')
export class EmulationController {
    constructor(private readonly emulateUseCase: EmulateUseCase) {}

    @All(':hash')
    async emulateRoot(
        @Param('hash') hash: string,
        @Req() request: Request,
        @Res() response: Response,
    ): Promise<void> {
        await this.respond(hash, '/', request, response);
    }

    @All(':hash/*path')
    async emulateWildcard(
        @Param('hash') hash: string,
        @Req() request: Request,
        @Res() response: Response,
    ): Promise<void> {
        const rawPath = request.params.path;
        const wildcardPath = Array.isArray(rawPath)
            ? rawPath.join('/')
            : (rawPath ?? '');
        const path = wildcardPath.startsWith('/')
            ? wildcardPath
            : `/${wildcardPath}`;

        await this.respond(hash, path, request, response);
    }

    private async respond(
        hash: string,
        path: string,
        request: Request,
        response: Response,
    ): Promise<void> {
        const result = await this.emulateUseCase.execute({
            hash,
            method: request.method,
            path,
            query: request.query as Record<string, unknown>,
            headers: request.headers,
            body: request.body,
        });

        for (const [key, value] of Object.entries(result.headers)) {
            response.setHeader(key, value);
        }

        response.status(result.status);

        if (result.body === undefined || result.body === null) {
            response.send();
            return;
        }

        response.send(result.body);
    }
}
