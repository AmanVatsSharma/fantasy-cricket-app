/**
 * Stub apiClient for the design-preview dev server.
 *
 * The real `src/app/api/apiClient.ts` is missing from the repo, so the
 * Metro resolver (`metro.config.js`) rewrites every `apiClient` import to
 * this file. It returns minimal happy-path responses so the LoginScreen's
 * `await apiClient.post('/auth/request-otp', ...)` call resolves without
 * throwing — letting the UI render end-to-end for design review.
 *
 * Behavior:
 *   - `get(url)` and `post(url, body)` both resolve with `{ data: { success: true } }`
 *   - `/auth/verify-otp` resolves with `data.success: false` and a generic
 *     message, so the screen's error path animates the shake and shows the
 *     "Invalid OTP" message. This is the most informative thing to see in a
 *     design preview.
 */

const otpVerify = (url: string) => {
  if (url.includes('/auth/verify-otp')) {
    return Promise.resolve({
      data: {
        success: false,
        message: 'Invalid OTP. Use any 4 digits to retry.',
      },
    });
  }
  return Promise.resolve({ data: { success: true } });
};

export const apiClient = {
  get: (url: string) => otpVerify(url),
  post: (url: string, _body?: unknown) => otpVerify(url),
  put: (url: string, _body?: unknown) => otpVerify(url),
  delete: (url: string) => otpVerify(url),
};

export default apiClient;
