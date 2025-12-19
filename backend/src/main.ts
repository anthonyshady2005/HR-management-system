import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for clients that will send cookies
  // Allow frontend URL from environment variable, or default to localhost for development
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5001';
  const allowedOrigins = frontendUrl.split(',').map(url => url.trim());
  
  app.enableCors({
    origin: (origin, callback) => {
      // In production, log CORS attempts for debugging
      if (process.env.NODE_ENV === 'production' && origin) {
        console.log('[CORS] Request from origin:', origin);
        console.log('[CORS] Allowed origins:', allowedOrigins);
      }
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        // In production, be more strict about no-origin requests
        if (process.env.NODE_ENV === 'production') {
          console.warn('[CORS] Request with no origin in production');
        }
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error('[CORS] Origin not allowed:', origin);
        callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Current-Role'],
  });

  // Parse cookies for JWT strategy to read auth_token
  app.use(cookieParser());
  
  // Debug middleware to log cookies in production (remove after debugging)
  if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      if (req.path === '/auth/select-role' || req.path === '/auth/me') {
        console.log('[CookieDebug]', {
          path: req.path,
          hasCookies: !!req.cookies,
          cookieKeys: req.cookies ? Object.keys(req.cookies) : [],
          hasAuthToken: !!req.cookies?.auth_token,
          origin: req.get('origin'),
          referer: req.get('referer'),
        });
      }
      next();
    });
  }

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
