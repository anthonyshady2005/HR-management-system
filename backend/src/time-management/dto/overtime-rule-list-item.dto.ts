import { Types } from "mongoose";

export class OvertimeRuleListItemDTO {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  active: boolean;
  approved: boolean;
}
