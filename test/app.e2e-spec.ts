import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as e from 'express';
import { Model } from 'mongoose';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { User } from 'src/modules/users/schemas/user.schema';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import axios from 'axios';
import {
  Transaction,
  TransactionStatus,
} from 'src/modules/transactions/schemas/transactions.schema';

describe('API End-to-end Tests', () => {
  let app: INestApplication;
  let userModel: Model<User>;
  let transactionModel: Model<Transaction>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userModel = moduleFixture.get('UserModel');
    transactionModel = moduleFixture.get('TransactionModel');
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    app.use(e.json({ limit: '50mb' }));

    await app.init();
  });

  beforeEach(async () => {
    await userModel.deleteMany({});
  });

  describe('Authentication', () => {
    const validUser = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    describe('POST /auth/register', () => {
      it('should register a new user successfully', () => {
        return request(app.getHttpServer())
          .post('/auth/register')
          .send(validUser)
          .expect(201);
      });

      it('should fail when email already exists', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send(validUser)
          .expect(201);

        return request(app.getHttpServer())
          .post('/auth/register')
          .send(validUser)
          .expect(422)
          .expect(({ body }) => {
            expect(body.message).toBe('User already exists');
          });
      });

      it('should fail when email is invalid', () => {
        return request(app.getHttpServer())
          .post('/auth/register')
          .send({
            ...validUser,
            email: 'invalid-email',
          })
          .expect(400)
          .expect(({ body }) => {
            expect(body.message).toContain('email must be an email');
          });
      });

      it('should fail when password is too weak', () => {
        return request(app.getHttpServer())
          .post('/auth/register')
          .send({
            ...validUser,
            password: 'weak',
          })
          .expect(400)
          .expect(({ body }) => {
            expect(body.message).toEqual([
              'password must be longer than or equal to 8 characters',
            ]);
          });
      });
    });

    describe('POST /auth/login', () => {
      it('should login successfully with valid credentials', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send(validUser);

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: validUser.email,
            password: validUser.password,
          })
          .expect(200);

        expect(response.headers['set-cookie']).toBeDefined();
        expect(response.headers['set-cookie'].length).toBe(2);
        expect(response.headers['set-cookie'][1]).toContain('access_token=');
        expect(response.headers['set-cookie'][0]).toContain('refresh_token=');
      });

      it('should fail with invalid password', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send(validUser);

        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: validUser.email,
            password: 'wrongpassword',
          })
          .expect(401)
          .expect(({ body }) => {
            expect(body.message).toBe('Unauthorized');
          });
      });

      it('should fail with non-existent email', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: validUser.password,
          })
          .expect(401)
          .expect(({ body }) => {
            expect(body.message).toBe('Unauthorized');
          });
      });

      it('should fail with invalid email format', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'invalid-email',
            password: validUser.password,
          })
          .expect(400)
          .expect(({ body }) => {
            expect(body.message).toContain('email must be an email');
          });
      });
    });

    describe('POST /auth/logout', () => {
      it('should successfully logout with valid token', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send(validUser);

        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send(validUser);

        const loginCookies = loginResponse.headers['set-cookie'];

        const response = await request(app.getHttpServer())
          .post('/auth/logout')
          .set('Cookie', loginCookies)
          .expect(200);

        const cookies = response.headers['set-cookie'];

        expect(cookies).toContain(
          'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        );

        expect(cookies).toContain(
          'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        );
      });

      it('should fail logout without auth token', () => {
        return request(app.getHttpServer()).post('/auth/logout').expect(401);
      });

      it('should fail when trying to consume authenticated route', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send(validUser);

        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send(validUser);

        const loginCookies = loginResponse.headers['set-cookie'];

        await request(app.getHttpServer())
          .post('/auth/logout')
          .set('Cookie', loginCookies)
          .expect(200);

        await request(app.getHttpServer())
          .get('/auth/me')
          .set('Cookie', loginCookies)
          .expect(401);
      });
    });

    describe('POST /auth/refresh', () => {
      it('should successfully refresh tokens', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send(validUser);

        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send(validUser);

        const initialCookies = loginResponse.headers['set-cookie'];

        const refreshResponse = await request(app.getHttpServer())
          .post('/auth/refresh')
          .set('Cookie', initialCookies)
          .expect(200);

        const newCookies = refreshResponse.headers[
          'set-cookie'
        ] as unknown as string[];

        expect(newCookies).toBeDefined();
        expect(newCookies.length).toBe(2);
      });

      it('should fail refresh with invalid token', () => {
        return request(app.getHttpServer())
          .post('/auth/refresh')
          .set('Cookie', ['refresh_token=invalid.token.here'])
          .expect(401);
      });

      it('should fail refresh without token', () => {
        return request(app.getHttpServer()).post('/auth/refresh').expect(400);
      });
    });

    describe('GET /auth/me', () => {
      it('should return user data with valid token', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send(validUser);

        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send(validUser);

        const loginCookies = loginResponse.headers['set-cookie'];

        const response = await request(app.getHttpServer())
          .get('/auth/me')
          .set('Cookie', loginCookies)
          .expect(200);

        expect(response.body.email).toBe(validUser.email);
      });
    });
  });

  describe('KYC', () => {
    let authCookies: string[];
    const validUser = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/register').send(validUser);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(validUser);

      authCookies = loginResponse.headers['set-cookie'] as any as string[];
    });

    describe('POST /kyc/upload-doc', () => {
      const validDocument = {
        filename: 'document.jpg',
        base64Data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2Q==',
      };

      it('should upload document successfully', () => {
        return request(app.getHttpServer())
          .post('/kyc/upload-doc')
          .set('Cookie', authCookies)
          .send({ document: validDocument })
          .expect(201);
      });

      it('should fail without authentication', () => {
        return request(app.getHttpServer())
          .post('/kyc/upload-doc')
          .send({ document: validDocument })
          .expect(401);
      });

      it('should fail with invalid base64 format', () => {
        return request(app.getHttpServer())
          .post('/kyc/upload-doc')
          .set('Cookie', authCookies)
          .send({
            document: { ...validDocument, base64Data: 'invalid-base64' },
          })
          .expect(400)
          .expect(({ body }) => {
            expect(body.message).toContain(
              'document.base64Data must be base64 encoded',
            );
          });
      });

      it('should fail with missing data', () => {
        return request(app.getHttpServer())
          .post('/kyc/upload-doc')
          .set('Cookie', authCookies)
          .send({})
          .expect(400)
          .expect(({ body }) => {
            expect(body.message).toContain(
              'document must be a non-empty object',
            );
          });
      });
    });

    describe('POST /kyc/upload-selfie', () => {
      const validSelfie = {
        filename: 'selfie.jpg',
        base64Data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2Q==',
      };

      it('should upload selfie successfully', async () => {
        return request(app.getHttpServer())
          .post('/kyc/upload-selfie')
          .set('Cookie', authCookies)
          .send({ selfie: validSelfie })
          .expect(201);
      });

      it('should fail without authentication', () => {
        return request(app.getHttpServer())
          .post('/kyc/upload-selfie')
          .send({ selfie: validSelfie })
          .expect(401);
      });

      it('should fail with invalid base64 format', () => {
        return request(app.getHttpServer())
          .post('/kyc/upload-selfie')
          .set('Cookie', authCookies)
          .send({
            selfie: {
              ...validSelfie,
              base64Data: 'invalid-base64',
            },
          })
          .expect(400)
          .expect(({ body }) => {
            expect(body.message).toContain(
              'selfie.base64Data must be base64 encoded',
            );
          });
      });

      it('should fail with missing data', () => {
        return request(app.getHttpServer())
          .post('/kyc/upload-selfie')
          .set('Cookie', authCookies)
          .send({})
          .expect(400)
          .expect(({ body }) => {
            expect(body.message).toContain('selfie must be a non-empty object');
          });
      });

      it('should validate file size limit', async () => {
        const base64Prefix = 'data:image/jpeg;base64,';

        const fileData = await readFile(resolve(__dirname, 'large-file.txt'));

        const largeBase64 = fileData.toString('base64');

        return request(app.getHttpServer())
          .post('/kyc/upload-selfie')
          .set('Cookie', authCookies)
          .send({
            selfie: {
              ...validSelfie,
              base64Data: base64Prefix + largeBase64,
            },
          })
          .expect(400)
          .expect(({ body }) => {
            expect(body.message).toContain(
              'selfie.File size exceeds 5MB limit',
            );
          });
      });
    });
  });

  describe('Users', () => {
    let authCookies: string[];

    const validUser = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/register').send(validUser);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(validUser);

      authCookies = loginResponse.headers['set-cookie'] as any as string[];
    });

    describe('PUT /users/password', () => {
      const newPassword = 'NewPassword123!';

      it('should update password successfully', async () => {
        await request(app.getHttpServer())
          .put('/users/password')
          .set('Cookie', authCookies)
          .send({ password: newPassword })
          .expect(200);

        await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: validUser.email,
            password: newPassword,
          })
          .expect(200);
      });

      it('should fail without authentication', () => {
        return request(app.getHttpServer())
          .put('/users/password')
          .send({ password: newPassword })
          .expect(401);
      });

      it('should fail with weak password', () => {
        return request(app.getHttpServer())
          .put('/users/password')
          .set('Cookie', authCookies)
          .send({ password: 'weak' })
          .expect(400)
          .expect(({ body }) => {
            expect(body.message).toEqual([
              'password must be longer than or equal to 8 characters',
            ]);
          });
      });

      it('should fail with missing password', () => {
        return request(app.getHttpServer())
          .put('/users/password')
          .set('Cookie', authCookies)
          .send({})
          .expect(400)
          .expect(({ body }) => {
            expect(body.message).toContain('password should not be empty');
          });
      });
    });
  });

  describe('Transactions', () => {
    let authCookies: string[];
    const validUser = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const validTransfer = {
      destinationAccount: '123456789',
      amount: 100,
      description: 'Test transfer',
    };

    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/register').send(validUser);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(validUser);

      authCookies = loginResponse.headers['set-cookie'] as any as string[];
    });

    beforeEach(async () => {
      await transactionModel.deleteMany({});
    });

    describe('POST /transfer', () => {
      const mockAxiosPost = jest.spyOn(axios, 'post');

      // Before each test
      beforeEach(() => {
        mockAxiosPost.mockClear();
      });

      it('should create transfer successfully', () => {
        return request(app.getHttpServer())
          .post('/transfer')
          .set('Cookie', authCookies)
          .send(validTransfer)
          .expect(201);
      });

      it('should fail without authentication', () => {
        return request(app.getHttpServer())
          .post('/transfer')
          .send(validTransfer)
          .expect(401);
      });

      it('should fail with missing amount', () => {
        return request(app.getHttpServer())
          .post('/transfer')
          .set('Cookie', authCookies)
          .send({
            destinationAccount: '123456789',
            description: 'Test transfer',
          })
          .expect(400)
          .expect(({ body }) => {
            expect(body.message).toContain(
              'amount must be a number conforming to the specified constraints',
            );
          });
      });

      it('should fail with negative amount', () => {
        return request(app.getHttpServer())
          .post('/transfer')
          .set('Cookie', authCookies)
          .send({
            ...validTransfer,
            amount: -100,
          })
          .expect(400)
          .expect(({ body }) => {
            expect(body.message).toContain('amount must not be less than 0.01');
          });
      });

      it('should fail with missing destination account', () => {
        return request(app.getHttpServer())
          .post('/transfer')
          .set('Cookie', authCookies)
          .send({
            amount: 100,
            description: 'Test transfer',
          })
          .expect(400)
          .expect(({ body }) => {
            expect(body.message).toContain(
              'destinationAccount should not be empty',
            );
          });
      });

      it('should fail with missing description', () => {
        return request(app.getHttpServer())
          .post('/transfer')
          .set('Cookie', authCookies)
          .send({
            destinationAccount: '123456789',
            amount: 100,
          })
          .expect(400)
          .expect(({ body }) => {
            expect(body.message).toContain('description should not be empty');
          });
      });

      it('should mark transaction as FAILED when mock API fails', async () => {
        mockAxiosPost.mockRejectedValueOnce(new Error('Mock API Error'));

        await request(app.getHttpServer())
          .post('/transfer')
          .set('Cookie', authCookies)
          .send(validTransfer)
          .expect(500);

        const transactions = await transactionModel.find({}).exec();
        expect(transactions).toHaveLength(1);
        expect(transactions[0].status).toBe(TransactionStatus.FAILED);
        expect(transactions[0].amount).toBe(validTransfer.amount);
        expect(transactions[0].destinationAccount).toBe(
          validTransfer.destinationAccount,
        );
      });
    });

    describe('GET /statement', () => {
      it('should return statement successfully', async () => {
        await request(app.getHttpServer())
          .post('/transfer')
          .set('Cookie', authCookies)
          .send(validTransfer)
          .expect(201);

        const response = await request(app.getHttpServer())
          .get('/statement')
          .set('Cookie', authCookies)
          .expect(200);

        expect(response.body.length).toBe(1);
      });

      it('should fail without authentication', () => {
        return request(app.getHttpServer()).get('/statement').expect(401);
      });
    });
  });
});
