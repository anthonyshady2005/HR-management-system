import { Injectable } from '@nestjs/common';

@Injectable()
export class PerformanceService {
  getDummyTemplates() {
    return [
      {
        id: '1',
        name: 'Annual Appraisal',
        ratingScale: '1-5',
        description: 'Dummy description',
        createdBy: 'HR Admin',
      },
    ];
  }
}
