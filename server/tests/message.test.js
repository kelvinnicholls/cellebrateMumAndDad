let expect = require('expect');

const {
    generateMessage
    ,generateLocationMessage
} = require('../utils/message');

describe('generateMessage', () => {
    it('should generate the correct message object', () => {
        let res = generateMessage("John", "Hello");
        expect(res).toInclude({
            from: "John",
            text: "Hello"
        });
        expect(res.createdAt).toBeA('number');
    });
});

describe('generateLocationMessage', () => {
    it('should generate the correct location object', () => {
        let res = generateLocationMessage('User','52.9574053','-2.1050578,17');
        expect(res).toInclude({
            from: "User",
            url: 'https://www.google.com/maps?q=52.9574053,-2.1050578,17'
        });
        expect(res.createdAt).toBeA('number');
    });
});
