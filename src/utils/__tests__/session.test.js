import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSession,
  getToken,
  setSession,
  updateSession,
  clearSession,
  isSessionValid,
} from '../session';

beforeEach(() => {
  localStorage.clear();
});

describe('session helpers', () => {
  it('returns null when nothing stored', () => {
    expect(getSession()).toBeNull();
    expect(getToken()).toBeNull();
  });

  it('set/get round-trip and token extraction', () => {
    setSession({ access_token: 'abc', user: { role: 'admin' } });
    expect(getSession().user.role).toBe('admin');
    expect(getToken()).toBe('abc');
  });

  it('updateSession merges without dropping fields', () => {
    setSession({ access_token: 'abc', user: { role: 'student' } });
    updateSession({ user: { role: 'teacher' } });
    const s = getSession();
    expect(s.access_token).toBe('abc');
    expect(s.user.role).toBe('teacher');
  });

  it('clearSession removes the session', () => {
    setSession({ access_token: 'abc' });
    clearSession();
    expect(getSession()).toBeNull();
  });

  it('survives corrupted JSON without throwing', () => {
    localStorage.setItem('session', '{not json');
    expect(getSession()).toBeNull();
  });

  it('isSessionValid checks token and expiry', () => {
    expect(isSessionValid(null)).toBe(false);
    expect(isSessionValid({ access_token: 't' })).toBe(true);
    expect(isSessionValid({ access_token: 't', expires_at: Date.now() + 1000 })).toBe(true);
    expect(isSessionValid({ access_token: 't', expires_at: Date.now() - 1000 })).toBe(false);
  });
});
