import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadFile, openFile } from '../fileDownload';
import { setSession } from '../session';

beforeEach(() => {
  localStorage.clear();
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:fake');
  globalThis.URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fileDownload', () => {
  it('downloadFile fetches the protected URL with the bearer token', async () => {
    setSession({ access_token: 'tok-123' });
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['x']),
    });

    await downloadFile('http://api/files/download/lesson_docs/a.pdf', 'a.pdf');

    const [, config] = globalThis.fetch.mock.calls[0];
    expect(config.headers.Authorization).toBe('Bearer tok-123');
  });

  it('openFile opens external URLs directly without fetching', async () => {
    globalThis.fetch = vi.fn();
    const open = vi.spyOn(window, 'open').mockImplementation(() => {});

    await openFile('https://youtube.com/watch?v=1');

    expect(open).toHaveBeenCalled();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('throws with status when the download fails', async () => {
    setSession({ access_token: 'tok' });
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'no' }),
    });

    await expect(
      downloadFile('http://api/files/download/x')
    ).rejects.toMatchObject({ status: 401 });
  });
});
