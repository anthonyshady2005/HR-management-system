import { Types } from "mongoose";
export declare class NotificationLogCreateDTO {
    to: Types.ObjectId;
    type: string;
    message?: string;
}
