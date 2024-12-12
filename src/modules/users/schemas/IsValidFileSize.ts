import { ValidationOptions, ValidateBy } from 'class-validator';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function IsValidFileSize(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isValidFileSize',
      validator: {
        validate: (value: string) => {
          if (!value?.startsWith('data:')) return true;
          const base64str = value.split(',')[1];
          const fileSize = Buffer.from(base64str, 'base64').length;
          return fileSize <= MAX_FILE_SIZE_BYTES;
        },
        defaultMessage: () => `File size exceeds ${MAX_FILE_SIZE_MB}MB limit`,
      },
    },
    validationOptions,
  );
}
