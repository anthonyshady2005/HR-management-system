import { Strategy } from 'passport-jwt';
import { Model } from 'mongoose';
import { EmployeeProfile } from '../../employee-profile/models/employee-profile.schema';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private userModel;
    constructor(userModel: Model<EmployeeProfile>);
    validate(payload: any): Promise<{
        _id: import("mongoose").Types.ObjectId;
        roles: any;
    }>;
}
export {};
