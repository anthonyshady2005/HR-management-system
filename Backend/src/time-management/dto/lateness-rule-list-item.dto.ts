import { Types } from "mongoose";

export class LatenessRuleListItemDTO {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  gracePeriodMinutes: number;
  deductionForEachMinute: number;
  active: boolean;
}
