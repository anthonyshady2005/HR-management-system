/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChangeWorkflowRuleDocument = HydratedDocument<ChangeWorkflowRule>;

@Schema({ collection: 'change_workflow_rules', timestamps: true })
export class ChangeWorkflowRule {
  @Prop({ type: [String], required: true })
  fieldNames: string[]; // governed fields this rule applies to

  @Prop({ type: Boolean, default: false })
  autoApprove: boolean; // if true, requests with ONLY these fields are auto-approved

  @Prop({ type: [String], default: [] })
  requiredApproverRoles: string[]; // roles that must approve (stub)
}

export const ChangeWorkflowRuleSchema = SchemaFactory.createForClass(ChangeWorkflowRule);
