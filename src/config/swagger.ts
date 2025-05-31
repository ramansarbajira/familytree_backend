import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Family Tree API')
    .setDescription('The API for Family Tree MVP')
    .setVersion('1.0')
    .addBearerAuth()
    .build();  

  const document = SwaggerModule.createDocument(app, config);
  
  // Organize by modules in Swagger UI
  const options = {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  };
  
  SwaggerModule.setup('api', app, document, options);
}