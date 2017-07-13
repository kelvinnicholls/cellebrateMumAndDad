let expect = require('expect');

const {
    isRealString
} = require('../utils/validation');

describe('isRealString', () => {
    it('should reject non-string values', () => {
        let res = isRealString(88);
        expect(res).toBe(false);
    });

    it('should reject string withn only spaces', () => {
        let res = isRealString("  ");
        expect(res).toBe(false);
    });

    it('should allow string withn non-space chars', () => {
        let res = isRealString("  X   X  ");
        expect(res).toBe(true);
    });

});