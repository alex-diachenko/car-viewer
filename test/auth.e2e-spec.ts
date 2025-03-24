import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Authentication System', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a signup request', () => {
    const testEmail = 'asdh@mail.com';

    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: testEmail, password: 'qweqwe' })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body;
        expect(id).toBeDefined();
        expect(email).toBe(testEmail);
      });
  });

  it('signup as a new user than get currently logged in user', async () => {
    const email = 'aaaa@gmail.com';

    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: 'qweewq' })
      .expect(201);

    const cookie = res.get('Set-Cookie');

    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie!)
      .expect(200);

    await expect(body.email).toEqual(email);
  });
});
