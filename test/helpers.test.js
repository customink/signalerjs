import {defaultDomain, daysAfterToday} from '../src/helpers';

describe('helpers', () => {
  describe('defaultDomain', () => {
    it('it removes first path segment if there are more than two', () => {
      const domain = defaultDomain('www.example.com');
      expect(domain).toEqual('.example.com');
    });

    it(
      'it returns the hostname if there are not more than two path segments',
      () => {
        const domain = defaultDomain('example.io');
        expect(domain).toEqual('.example.io');
      }
    );
  });

  describe('daysAfterToday', () => {
    it('returns date number of days after current time', () => {
      Date.now = jest.fn(() => 1487076708000)
      const date = daysAfterToday(20);
      expect(date).toEqual('Mon, 06 Mar 2017 12:51:48 GMT');
    });
  });
});
