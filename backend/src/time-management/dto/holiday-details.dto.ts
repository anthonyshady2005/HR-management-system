import { Types } from "mongoose";
import { HolidayType } from "../models/enums";

export class HolidayDetailsDTO {
  _id: Types.ObjectId;
  type: HolidayType;
  startDate: Date;
  endDate?: Date;
  name?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
