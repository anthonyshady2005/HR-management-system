import { Types } from "mongoose";

export class NotificationLogDetailsDTO {
  _id: Types.ObjectId;

  to: {
    _id: Types.ObjectId;
    fullName?: string;
    email?: string;
  };

  type: string;
  message?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
