const faker = require('faker');
var git = require("./git");

let number = faker.random.alphaNumeric;
let result = git.randomChars(faker.random.number);

describe('Git administration', () => {
  it('Should be return a random char.', async () => {
    expect(result).toMatchObject(number);
  })
})