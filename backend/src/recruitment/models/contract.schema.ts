import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Contract {

  @Prop({ type: Types.ObjectId, ref: 'Offer', required: true })
  offerId: Types.ObjectId;

  @Prop()
  acceptanceDate: Date;

  // FINAL ACCEPTED COMPENSATION
  @Prop({ required: true })
  grossSalary: number;

  @Prop()
  signingBonus?: number;

  @Prop()
  role: string;

  @Prop()
  benefits?: [string];

  @Prop({ type: Types.ObjectId, ref: 'Document' })
  documentId: Types.ObjectId;

  // SIGNATURES
  @Prop()
  employeeSignatureUrl?: string;

  @Prop()
  employerSignatureUrl?: string;

  @Prop()
  employeeSignedAt?: Date;

  @Prop()
  employerSignedAt?: Date;

  // SIGNING TOKENS (for public signing links)
  @Prop()
  employeeSigningToken?: string;

  @Prop()
  employeeSigningTokenExpiresAt?: Date;

  @Prop()
  employerSigningToken?: string;

  @Prop()
  employerSigningTokenExpiresAt?: Date;

  // SIGNATURE DETAILS
  @Prop()
  employeeTypedName?: string;

  @Prop()
  employeeSigningIp?: string;

  @Prop()
  employerTypedName?: string;

  @Prop()
  employerSigningIp?: string;
}

export type ContractDocument = HydratedDocument<Contract>;
export const ContractSchema = SchemaFactory.createForClass(Contract);