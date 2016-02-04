var assert = require('assert'),
    ClientDAO = require('../lib/ClientDAO'),
    config = require('../config.json'),
    PurchaseDAO = require('../lib/PurchaseDAO')

PurchaseDAO.initPurchaseSequence()

describe('ClientDAO', function () {
    describe('#addClient()', function () {

        it('add empty object should return an error', function (done) {
            ClientDAO.addClient({}, function (pResult) {
                assert.equal(pResult.success, false)
                assert.equal(config.statusCodes.mandatoryFieldsMissing, pResult.statusCode)
                done()
            })
        })

        it('add a client without firstname shouldn return an error', function (done) {
            ClientDAO.addClient({
                "title": "mr",
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
                "complementaryNote": "Nothing much"
            }, function (pResult) {
                assert.equal(pResult.success, false)
                assert.equal(config.statusCodes.mandatoryFieldsMissing, pResult.statusCode)
                done()
            })
        })

        it('add a client without a city in the address should return an error', function (done) {
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
                    "country": "FR"
                },
                "complementaryNote": "Nothing much"
            }, function (pResult) {
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
                "purchases": [
                    {
                        "transactionDate": "02/11/2015",
                        "amount": 4000,
                        "productID": "TORXX"
                    }
                ],
                "complementaryNote": "Nothing much"
            }, function (pResult) {
                assert.equal(
                    (
                        pResult.success === true
                        ) ||
                    (
                        pResult.success === false && (
                            config.statusCodes.duplicateEntry.email === pResult.statusCode ||
                            config.statusCodes.duplicateEntry.celPhone === pResult.statusCode
                            )
                        ), true
                    )
                done()
            })
        })
    })
})