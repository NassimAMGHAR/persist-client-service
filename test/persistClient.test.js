var assert = require('assert'),
	ClientDAO = require('../lib/ClientDAO')
  config = require('../config.json')

describe('ClientDAO', function() {
  describe('#addClient()', function () {
    
    it('add empty object should return an error', function (done) {
      ClientDAO.addClient({}, function(pResult) {
        assert.equal(pResult.success, false)
        assert.equal(config.statusCodes.mandatoryFieldsMissing, pResult.statusCode)
        done()
      })
    })
    
    it('add a client without purchase should return an error', function (done) {
      ClientDAO.addClient({
        "title": "mr",
        "firstname": "John",
        "lastname": "Doe",
        "email": "john@doe.com",
        "birthday": "02/11/85",
        "company": "ACME Inc.",
        "budget": 5000,
        "celPhone": "0612345678",
        "officePhone": "0112345678",
        "address": {
          "street": "5 rue Toto",
              "zipCode": "75001",
              "city": "Paris",
              "country": "FR"
        },
        "purchases": [],
        "complementaryNote": "Nothing much"
      }, function(pResult) {
              assert.equal(pResult.success, false)
              assert.equal(config.statusCodes.mandatoryFieldsMissing, pResult.statusCode)
              done()
      })
    })
    
    it('add a client without a transaction date in the purchase should return an error', function (done) {
      ClientDAO.addClient({
        "title": "mr",
        "firstname": "John",
        "lastname": "Doe",
        "email": "john@doe.com",
        "birthday": "02/11/85",
        "company": "ACME Inc.",
        "budget": 5000,
        "celPhone": "0612345678",
        "officePhone": "0112345678",
        "address": {
          "street": "5 rue Toto",
              "zipCode": "75001",
              "city": "Paris",
              "country": "FR"
        },
        "purchases": [ { "amount": 5000, "productID": "AMEX001" } ],
        "complementaryNote": "Nothing much"
      }, function(pResult) {
              assert.equal(pResult.success, false)
              assert.equal(config.statusCodes.mandatoryFieldsMissing, pResult.statusCode)
              done()
      })
    })
    
    it('add a client with all the mandatory fields return an success if the current entry exists, then return error duplicate entry', function (done) {
      ClientDAO.addClient({
        "title": "mr",
        "firstname": "John",
        "lastname": "Doe",
        "email": "john@doe.com",
        "birthday": "02/11/85",
        "company": "ACME Inc.",
        "budget": 5000,
        "celPhone": "0612345678",
        "officePhone": "0112345678",
        "address": {
          "street": "5 rue Toto",
              "zipCode": "75001",
              "city": "Paris",
              "country": "FR"
        },
        "purchases": [ { "amount": 5000, "productID": "AMEX001", "transactionDate": "01/03/2016" } ],
        "complementaryNote": "Nothing much"
      }, function(pResult) {
              assert.equal(
                (
                  pResult.success === true
                  ) || 
                (
                  pResult.success === false && (
                    config.statusCodes.duplicateEntry.email === pResult.statusCode ||
                    config.statusCodes.duplicateEntry.celPhone === pResult.statusCode
                  )
                  ) , true
                  )
              done()
      })
    })
  })
})