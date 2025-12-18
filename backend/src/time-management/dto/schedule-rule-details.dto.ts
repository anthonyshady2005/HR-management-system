import { Types } from "mongoose";

export class ScheduleRuleDetailsDTO {
  _id: Types.ObjectId;
  name: string;
  pattern: string;
  active: boolean;
}
