import { describe, it, expect, vi } from 'vitest';
import { handleError } from '../handleError';

describe('handleError', () => {
  it('shows a connection message for network failures', () => {
    const setToast = vi.fn();
    handleError(new Error('Failed to fetch'), setToast);
    expect(setToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    );
    expect(setToast.mock.calls[0][0].message).toMatch(/недоступен/i);
  });

  it('surfaces a string detail from the response', () => {
    const setToast = vi.fn();
    handleError({ response: { data: { detail: 'Неправильный пароль' } } }, setToast);
    expect(setToast).toHaveBeenCalledWith({ message: 'Неправильный пароль', type: 'error' });
  });

  it('joins array validation details', () => {
    const setToast = vi.fn();
    handleError(
      { response: { data: { detail: [{ msg: 'a' }, { msg: 'b' }] } } },
      setToast
    );
    expect(setToast.mock.calls[0][0].message).toBe('a, b');
  });

  it('falls back to a generic message', () => {
    const setToast = vi.fn();
    handleError({}, setToast);
    expect(setToast.mock.calls[0][0].message).toMatch(/что-то пошло не так/i);
  });
});
