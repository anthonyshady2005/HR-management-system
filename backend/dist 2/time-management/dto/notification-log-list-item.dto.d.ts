import { Types } from "mongoose";
export declare class NotificationLogListItemDTO {
    _id: Types.ObjectId;
    to: Types.ObjectId;
    type: string;
    message?: string;
    createdAt?: Date;
}
