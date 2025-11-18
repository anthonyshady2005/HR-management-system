// organization.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('organization')
export class OrganizationController {
  @Get()
  getAll() {
    return { message: 'Hello from Organization Module!' };
  }
}
