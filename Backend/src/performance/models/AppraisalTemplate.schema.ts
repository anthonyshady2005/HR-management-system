import{Schema,Prop, SchemaFactory}from '@nestjs/mongoose'
import {HydratedDocument, Types}from 'mongoose'
import { ref } from 'process';

export type AppraisalTemplateDocument=HydratedDocument<AppraisalTemplate>
@Schema({timestamps:true})
export class AppraisalTemplate{
    @Prop({required:true})
    name:string;
    
    @Prop()
    description?:string;

    @Prop({required:true})
    ratingScale:string;

    @Prop({required:true,ref:'Employee'})
    createdBy:Types.ObjectId;
}
export const AppraisalTemplateSchema=SchemaFactory.createForClass(AppraisalTemplate);