import { Type } from 'class-transformer';
import { IsNotEmptyObject, ValidateNested } from 'class-validator';
import { KYCFile } from 'src/modules/users/schemas/user.schema';

export class UploadSelfieDto {
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => KYCFile)
  selfie: KYCFile;
}
