export class LatenessRule {
  _id: string;
  name: string;
  description?: string;
  gracePeriodMinutes: number;
  deductionForEachMinute: number;
  active: boolean;

  constructor(data: Partial<LatenessRule>) {
    this._id = data._id || '';
    this.name = data.name || '';
    this.description = data.description;
    this.gracePeriodMinutes = data.gracePeriodMinutes ?? 0;
    this.deductionForEachMinute = data.deductionForEachMinute ?? 0;
    this.active = data.active ?? true;
  }
}
