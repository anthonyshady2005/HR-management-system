import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface User {
      _id: Types.ObjectId;
      sub: string;
      roles: string[];
    }

    interface Request {
      user?: User;
    }
  }
}

export {};

