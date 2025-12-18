import { Types } from "mongoose";

export class ShiftTypeDetailsDTO {
  _id: Types.ObjectId;
  name: string;
  active: boolean;
}
