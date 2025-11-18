import { Schema ,Prop, SchemaFactory} from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AppraisalRatingDocument=HydratedDocument<AppraisalRating>
@Schema({timestamps:true})
export class AppraisalRating{
    @Prop({type:Types.ObjectId,ref:'AppraisalAssignment',required:true})
    appraisalId:Types.ObjectId

    @Prop({required:true,type:Object})
    criteriaRatings:Record<string,number|string>

  @Prop()
  comments?: string;

  @Prop()
  developmentRecommendations?: string;

  @Prop()
  attendanceScore?: number;

  @Prop()
  punctualityScore?: number;

  @Prop({ required: true })
  overallScore: number;
}
export const AppraisalRatingSchema=SchemaFactory.createForClass(AppraisalRating);