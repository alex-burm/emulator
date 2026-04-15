import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/presentation/filters/global-exception.filter';
import { LoggingInterceptor } from './shared/presentation/interceptors/logging.interceptor';
import { ResponseEnvelopeInterceptor } from './shared/presentation/interceptors/response-envelope.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api', {
        exclude: [
            { path: 'emulate/:hash', method: RequestMethod.ALL },
            { path: 'emulate/:hash/*path', method: RequestMethod.ALL },
        ],
    });
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseEnvelopeInterceptor());

    const port = Number(process.env.APP_PORT ?? 3000);
    await app.listen(port, '0.0.0.0');
}
bootstrap();
