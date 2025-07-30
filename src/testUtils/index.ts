/**
 * @hidden
 */
export async function fakePromise(n = 4): Promise<void> {
  for (let i = 0; i < n; i += 1) {
    await new Promise(resolve => setImmediate(() => resolve(null)));
  }
}

/**
 * @hidden
 *
 * Awaits multiple promises and advances jest time after each one
 */
export async function fakePromises(): Promise<void> {
  for (let i = 0; i < 6; i++) {
    await fakePromise();

    jest.advanceTimersByTime(2000);
  }
}
