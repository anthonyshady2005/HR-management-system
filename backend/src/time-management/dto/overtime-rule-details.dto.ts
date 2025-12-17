import { Types } from "mongoose";

export class OvertimeRuleDetailsDTO {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  active: boolean;
  approved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
