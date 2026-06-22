import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiRequest } from '../apiRequest';

function mockFetch(response) {
  globalThis.fetch = vi.fn().mockResolvedValue(response);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('apiRequest', () => {
  it('sends JSON body with Content-Type and Authorization', async () => {
    mockFetch({ ok: true, status: 200, json: async () => ({ id: 1 }) });

    const result = await apiRequest('/x', { method: 'POST', data: { a: 1 }, token: 't' });

    expect(result).toEqual({ id: 1 });
    const [, config] = globalThis.fetch.mock.calls[0];
    expect(config.headers['Content-Type']).toBe('application/json');
    expect(config.headers.Authorization).toBe('Bearer t');
    expect(config.body).toBe(JSON.stringify({ a: 1 }));
  });

  it('does not set Content-Type for FormData uploads', async () => {
    mockFetch({ ok: true, status: 200, json: async () => ({ url: '/f' }) });
    const fd = new FormData();
    fd.append('file', 'x');

    await apiRequest('/upload', { method: 'POST', data: fd, token: 't' });

    const [, config] = globalThis.fetch.mock.calls[0];
    expect(config.headers['Content-Type']).toBeUndefined();
    expect(config.body).toBe(fd);
  });

  it('returns null for 204 responses', async () => {
    mockFetch({ ok: true, status: 204, json: async () => null });
    const result = await apiRequest('/x', { method: 'DELETE', token: 't' });
    expect(result).toBeNull();
  });

  it('throws an error carrying status and response detail', async () => {
    mockFetch({ ok: false, status: 401, json: async () => ({ detail: 'no' }) });

    await expect(apiRequest('/x', { token: 't' })).rejects.toMatchObject({
      status: 401,
      response: { data: { detail: 'no' } },
    });
  });
});
