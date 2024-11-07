import { afterAll, beforeAll, describe, it } from '@std/testing/bdd';
import { expect } from '@std/expect';
import { decode } from '@zaubrik/djwt';
import {
  dropDatabase,
  generateTestDbName,
} from '../../test-helpers/db-utils.ts';
import { initDbAndApp } from '../../test-helpers/init-db-and-app.ts';
import { createApp } from '../create-app.ts';
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
} from '../../test-helpers/constants.ts';

describe('auth', () => {
  const testDbName = generateTestDbName();
  const app = createApp();

  beforeAll(async () => {
    await initDbAndApp(testDbName, app);
  });

  afterAll(async () => {
    Deno.env.set('DB_NAME', 'postgres');
    await dropDatabase(testDbName);
  });

  describe('POST /auth', () => {
    it('should return a 200 and auth token when given valid credentials', async () => {
      const response = await app.request('http://localhost:8000/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: ADMIN_USERNAME,
          password: ADMIN_PASSWORD,
        }),
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('token');
      expect(body.token).toBeDefined();
      expect(typeof body.token).toBe('string');
    });

    it('should return JWT token of the expected shape', async () => {
      type PayloadType = {
        exp: number;
        iat: number;
        nbf: number;
        remainingRefreshes: number;
        userId: string;
      };
      const response = await app.request('http://localhost:8000/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: ADMIN_USERNAME,
          password: ADMIN_PASSWORD,
        }),
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      const { token } = body;
      const [header, payload] = decode<PayloadType>(token);
      expect(header).toBeDefined();
      expect(payload).toBeDefined();
      expect(header).toEqual({ alg: 'ES256', iss: 'runbookbuddy', typ: 'JWT' });
      expect(payload.exp).toBeDefined();
      expect(payload.iat).toBeDefined();
      expect(payload.nbf).toBeDefined();
      expect(payload.remainingRefreshes).toBe(2);
      expect(payload.userId).toBeDefined();
    });

    it('should return a 400 when given partial payload', async () => {
      const response = await app.request('http://localhost:8000/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: ADMIN_USERNAME,
        }),
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toMatchObject({
        issues: [
          {
            code: 'invalid_type',
            expected: 'string',
            received: 'undefined',
            path: ['password'],
            message: 'password is a required field',
          },
        ],
      });
    });

    it('should return a 401 when given invalid credentials', async () => {
      const response = await app.request('http://localhost:8000/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: ADMIN_USERNAME,
          password: 'invalid',
        }),
      });

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toBe('Invalid username or password');
    });

    it('should return a 401 when given invalid credentials on a missing user', async () => {
      const response = await app.request('http://localhost:8000/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'unknown-user',
          password: 'invalid',
        }),
      });

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toBe('Invalid username or password');
    });
  });

  describe('POST /register', () => {
    it('should return a 200 and user id when given valid credentials', async () => {
      const response = await app.request('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          password: 'testpassword',
        }),
      });
      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toHaveProperty('userId');
      expect(body.userId).toBeDefined();
      expect(typeof body.userId).toBe('string');

      // expect user id to be a guid
      expect(body.userId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should return a 400 when given user that already exists', async () => {
      const response = await app.request('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: ADMIN_USERNAME,
          password: 'testpassword',
        }),
      });
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toBe('Username did not pass required criteria');
    });
  });

  describe('GET /refresh-token', () => {
    it('should return a 200 and user id when given a valid token', async () => {
      // Get a token for actual test
      const response = await app.request('http://localhost:8000/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: ADMIN_USERNAME,
          password: ADMIN_PASSWORD,
        }),
      });
      expect(response.status).toBe(200);
      const body = await response.json();
      const { token } = body;

      const refreshResponse = await app.request(
        'http://localhost:8000/refresh-token',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        },
      );
      expect(refreshResponse.status).toBe(200);
      const refreshBody = await refreshResponse.json();
      expect(refreshBody).toHaveProperty('token');
      expect(refreshBody.token).toBeDefined();
      expect(typeof refreshBody.token).toBe('string');
      expect(refreshBody.token).not.toBe(token);
    });

    it('should decrement remaining refreshes on a refresh', async () => {
      type PayloadType = {
        exp: number;
        iat: number;
        nbf: number;
        remainingRefreshes: number;
        userId: string;
      };
      const response = await app.request('http://localhost:8000/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: ADMIN_USERNAME,
          password: ADMIN_PASSWORD,
        }),
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      const { token } = body;

      const refreshResponse = await app.request(
        'http://localhost:8000/refresh-token',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        },
      );

      expect(refreshResponse.status).toBe(200);
      const refreshBody = await refreshResponse.json();
      expect(refreshBody).toHaveProperty('token');
      expect(refreshBody.token).toBeDefined();
      const [_header, payload] = decode<PayloadType>(refreshBody.token);
      expect(payload).toBeDefined();
      expect(payload.remainingRefreshes).toBe(1);
    });
  });
});
