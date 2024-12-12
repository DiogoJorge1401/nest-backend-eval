import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { compare, hash } from 'bcryptjs';
import { IsNotEmpty } from 'class-validator';
import { MongoId } from 'src/types/mongo-id.types';
import { IsValidFileSize } from './IsValidFileSize';
import { IsValidBase64File } from './IsValidBase64File';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class KYCFile {
  @Prop()
  @IsNotEmpty()
  filename: string;

  @Prop()
  @IsNotEmpty()
  @IsValidBase64File()
  @IsValidFileSize()
  base64Data: string;
}

export const KYCFileSchema = SchemaFactory.createForClass(KYCFile);

@Schema({
  timestamps: true,
  collection: 'users',
})
export class User {
  @ApiProperty({ type: String })
  _id?: MongoId;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop({ type: KYCFileSchema })
  document: KYCFile;

  @Prop({ type: KYCFileSchema })
  selfie: KYCFile;

  comparePassword: (password: string) => Promise<boolean>;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type RequestUser = Omit<User, '_id'> & { _id: string };

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (password: string) {
  return await compare(password, this.password);
};
