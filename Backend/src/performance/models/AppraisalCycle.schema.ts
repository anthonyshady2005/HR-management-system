import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import{HydratedDocument, Types} from 'mongoose'
export type AppraisalCycleDocument=HydratedDocument<AppraisalCycle>
@Schema({timestamps:true})
export class AppraisalCycle{
    @Prop({required:true})
    name:string;

    @Prop({required:true})
    startDate:Date

    @Prop({required:true})
    endDate:Date

    @Prop({required:true,ref:'AppraisalTemplate',type:[Types.ObjectId]})
    template_ids:Types.ObjectId[];

    @Prop({required:true,ref:'Employee'})
    createdBy:Types.ObjectId;

    @Prop({required:true,enum:['annual','semi-annual','Probationary']})
    cycleType:string
}
export const AppraisalCycleSchema=SchemaFactory.createForClass(AppraisalCycle);