import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export enum AppraisalAssignmentStatus{
    ASSIGNED='assigned',
    IN_PROGRESS='in_progress',
    COMPLETED='completed'
}
export type AppraisalAssignmentDocument=HydratedDocument<AppraisalAssignment>
@Schema({timestamps:true})
export class AppraisalAssignment{
    @Prop({required:true,ref:'AppraisalCycle'})
    cycleId:Types.ObjectId

    @Prop({required:true,ref:'AppraisalTemplate'})
    appraisalTemplate:Types.ObjectId

    @Prop({required:true,ref:'Employee'})
    employeeId:Types.ObjectId

    @Prop({required:true,ref:'Employee'})
    managerId:Types.ObjectId

    @Prop({required:true,enum:AppraisalAssignmentStatus})
    assignmentStatus:AppraisalAssignmentStatus
}

export const AppraisalAssignmentSchema=SchemaFactory.createForClass(AppraisalAssignment)