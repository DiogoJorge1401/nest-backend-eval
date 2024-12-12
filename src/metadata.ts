/* eslint-disable */
export default async () => {
    const t = {
        ["./modules/users/schemas/user.schema"]: await import("./modules/users/schemas/user.schema"),
        ["./modules/transactions/schemas/transactions.schema"]: await import("./modules/transactions/schemas/transactions.schema")
    };
    return { "@nestjs/swagger": { "models": [[import("./modules/users/schemas/user.schema"), { "KYCFile": { filename: { required: true, type: () => String }, base64Data: { required: true, type: () => String } }, "User": { _id: { required: false, type: () => Object }, email: { required: true, type: () => String }, password: { required: true, type: () => String }, document: { required: true, type: () => t["./modules/users/schemas/user.schema"].KYCFile }, selfie: { required: true, type: () => t["./modules/users/schemas/user.schema"].KYCFile } } }], [import("./modules/users/dtos/update-password.dto"), { "UpdatePasswordDto": { password: { required: true, type: () => String, minLength: 8 } } }], [import("./modules/users/dtos/create-user.dto"), { "RegisterUserDto": { email: { required: true, type: () => String, format: "email" }, password: { required: true, type: () => String, minLength: 8 } } }], [import("./modules/auth/dtos/login-payload.dto"), { "LoginPayloadDto": { email: { required: true, type: () => String, format: "email" }, password: { required: true, type: () => String } } }], [import("./modules/kyc/dtos/upload-document.dto"), { "UploadDocumentDto": { document: { required: true, type: () => t["./modules/users/schemas/user.schema"].KYCFile } } }], [import("./modules/kyc/dtos/upload-selfie.dto"), { "UploadSelfieDto": { selfie: { required: true, type: () => t["./modules/users/schemas/user.schema"].KYCFile } } }], [import("./modules/transactions/schemas/transactions.schema"), { "Transaction": { userId: { required: true, type: () => t["./modules/users/schemas/user.schema"].User }, type: { required: true, enum: t["./modules/transactions/schemas/transactions.schema"].TransactionType }, status: { required: true, enum: t["./modules/transactions/schemas/transactions.schema"].TransactionStatus }, amount: { required: true, type: () => Number }, description: { required: true, type: () => String }, destinationAccount: { required: true, type: () => String } } }], [import("./modules/transactions/dtos/transfer.dto"), { "TransferDto": { destinationAccount: { required: true, type: () => String }, amount: { required: true, type: () => Number, minimum: 0.01 }, description: { required: true, type: () => String } } }]], "controllers": [[import("./modules/users/users.controller"), { "UsersController": { "updatePassword": {} } }], [import("./modules/auth/auth.controller"), { "AuthController": { "create": {}, "signIn": {}, "logout": {}, "refresh": {}, "me": { type: Object } } }], [import("./modules/kyc/kyc.controller"), { "KycController": { "uploadDocument": {}, "uploadSelfie": {} } }], [import("./modules/transactions/transactions.controller"), { "TransactionsController": { "createTransfer": {}, "getStatement": { type: [Object] } } }]] } };
};