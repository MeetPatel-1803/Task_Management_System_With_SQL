const { validationMessageKey, randomTokens } = require('../src/utils/helper');

describe('utils/helper', () => {
  test('validationMessageKey builds key from joi-like error', () => {
    const apiTag = 'Auth';
    const error = {
      details: [
        {
          context: { key: 'email' },
          type: 'string.required',
        },
      ],
    };
    const result = validationMessageKey(apiTag, error);
    expect(result).toBe('AuthEmailRequired');
  });

  test('randomTokens length aggregates chunks', () => {
    const token = randomTokens(2);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });
});
