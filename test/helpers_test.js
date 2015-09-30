import {assert} from 'chai';
import sinon from 'sinon';
import {defaultDomain, daysAfterToday} from 'src/helpers';

describe('helpers', () => {
  describe('defaultDomain', () => {
    it('it removes first path segment if there are more than two', () => {
      var domain = defaultDomain('www.example.com');
      assert.equal(domain, '.example.com');
    });

    it('it returns the hostname if there are not more than two path segments', () => {
      var domain = defaultDomain('example.io');
      assert.equal(domain, 'example.io');
    });
  });

  describe('daysAfterToday', () => {
    it('returns date number of days after current time', () => {
      var dateStub = sinon.stub(Date, 'now', () => {
        return 1443659501420;
      });
      var date = daysAfterToday(20);
      assert.equal(date, 'Wed, 21 Oct 2015 00:31:41 GMT');
      dateStub.restore();
    });
  });
});
