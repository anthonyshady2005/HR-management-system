import { Controller, Get } from '@nestjs/common';
import { PerformanceService } from './performance.service';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get()
  getAllTemplates() {
    return this.performanceService.getDummyTemplates();
  }
}

