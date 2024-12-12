import { ValidateBy, ValidationOptions } from 'class-validator';

export function IsValidBase64File(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'IsValidBase64File',
      validator: {
        validate: (value: string) => {
          const regex = /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/;
          const matches = value.match(regex);

          if (!matches || matches.length !== 3) return false;

          const base64Data = matches[2];
          try {
            return (
              Buffer.from(base64Data, 'base64').toString('base64') ===
              base64Data
            );
          } catch {
            return false;
          }
        },
        defaultMessage: () => 'base64Data must be base64 encoded',
      },
    },
    validationOptions,
  );
}
