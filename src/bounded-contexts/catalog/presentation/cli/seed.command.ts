import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../../app.module';
import { CatalogSeedService } from '../../infrastructure/seed/catalog-seed.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: ['log', 'error', 'warn'],
    });

    const seedService = app.get(CatalogSeedService);
    await seedService.runFullSync();

    await app.close();
}

bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
