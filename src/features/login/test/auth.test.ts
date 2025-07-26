import { login } from '@/features/login/services/auth-service';
import { describe, it, expect } from 'vitest';

describe('login', () => {
  it('should return true on successful login', async () => {
    const body = { username: 'user', password: 'user' };
    const res = await login(body);
    expect(res).toBe(true);
  });

  it('should throw error message on failed login', async () => {
    expect.assertions(1);
    try {
      const body = { username: 'user', password: 'wrong' };
      await login(body);
    } catch (err: unknown) {
      expect((err as Error).message).toMatch('Invalid username or password');
    }
  });
});
