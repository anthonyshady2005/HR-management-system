import { Types } from "mongoose";

export class ScheduleRuleListItemDTO {
  _id: Types.ObjectId;
  name: string;
  pattern: string;
  active: boolean;
}
