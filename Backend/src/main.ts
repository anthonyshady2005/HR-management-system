import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for clients that will send cookies
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Parse cookies for JWT strategy to read auth_token
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('HR Platform API')
    .setDescription('The HR Platform API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
