const request = require('supertest')
const server = require('../index').callback()

module.exports = request(server)
