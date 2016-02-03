var config = require('../config.json'),
    PurchaseModel = require('../model/Purchase'),
    SequenceModel = require('../model/Sequence'),
    mongoose = require('mongoose'),
    PurchaseSchema = new mongoose.Schema(PurchaseModel),
    jsonRequireFields = require("json-required-fields")

var Purchase = mongoose.model('purchases', PurchaseSchema),
    vSequenceConnection = mongoose.createConnection('mongodb://' + config.databaseURL + '/' + config.sequencesDatabaseName),
    vPurchaseConnection = mongoose.createConnection('mongodb://' + config.databaseURL + '/' + config.purchasesDatabaseName),
    SequenceSchema = new mongoose.Schema(SequenceModel),
    Sequence = vSequenceConnection.model('sequences', SequenceSchema),
    Purchase = vPurchaseConnection.model('purchases', PurchaseSchema)

var PurchaseDAO = (function () {

    var initPurchaseSequence = function () {
        Sequence.findOneAndUpdate(
            { name: 'purchase' },
            {},
            function (pErr, pResult) {
                if (!pErr) {
                    if (!pResult) {
                        (new Sequence({ name: 'purchase', sequenceValue: 0 })).save(function (e) {
                            e ? console.log(e) : console.log('initilised sequence')
                        })
                    }
                } else {
                    console.log(pErr)
                }
            }
            )
    }

    var updatePurchase = function (pPurchase, pQuery, pReqBody, i, pErr, pResultCallback, pSentYet) {
        pPurchase.update(pQuery, pReqBody.purchases[i], {
            upsert: true,
            setDefaultsOnInsert: true
        }, function (err, numRowAffected) {
            if (err) {
                pErr = err
            }

            if (!pSentYet.value && i >= pReqBody.purchases.length - 1) {

                if (pErr) {
                    if (pErr.name === 'ValidationError') {
                        pResultCallback({
                            success: false,
                            message: 'Another Client with the same ' +
                            Object.keys(pErr.errors)[0] +
                            ' already exists',
                            statusCode: config.statusCodes.duplicateEntry[
                            Object.keys(pErr.errors)[0]]
                        })
                    } else {
                        pResultCallback({
                            success: false,
                            message: 'Sorry, something went couldn\'t update the purchases'
                        })
                    }
                } else {
                    pResultCallback({
                        success: true,
                        message: 'Correctly updated the purchases'
                    })
                }
                pSentYet.value = true
            }
        })
    }
    /**
     * Function: addPurchases, adds or updates an array of purchases relating to a client
     */
    var addPurchases = function (pReqBody, pResultCallback) {
        var vErr,
            vSentYet = { value: false }

        if (pReqBody.purchases.length === 0 || !pReqBody.purchases) {
            pResultCallback({
                success: false,
                message: 'You must provide at least one purchase',
                statusCode: config.statusCodes.mandatoryFieldsMissing
            })
            return false
        }

        for (var i in pReqBody.purchases) {
            var vResultPurchase = jsonRequireFields.checkReqHasFields(pReqBody.purchases[
                i], [
                    "clientId",
                    "amount",
                    "productID",
                    "transactionDate"
                ], '')

            if (vResultPurchase.length > 0) {
                pResultCallback({
                    success: false,
                    message: 'Required field: \'' + [vResultPurchase[0]] +
                    '\' is missing',
                    statusCode: config.statusCodes.mandatoryFieldsMissing
                })
                return false
            }

            if (pReqBody.purchases[i].id) {
                updatePurchase(Purchase, { _id: pReqBody.purchases[i].id }, pReqBody, i, vErr, pResultCallback, vSentYet)
            } else {

                Sequence.findOneAndUpdate(
                    { name: 'purchase' },
                    { $inc: { sequenceValue: 1 } },
                    function (pErr, pResult) {
                        if (!pErr) {
                            updatePurchase(Purchase, { _id: pResult.sequenceValue }, pReqBody, i, vErr, pResultCallback, vSentYet)
                        }
                    }
                    )
            }
        }
    }

    var getPurchases = function (pQuery, pResultCallback) {

        Purchase.find(pQuery).sort('transactionDate').exec(
            function (err, pResults) {
                pResultCallback(pResults)
            })
    }

    return {
        addPurchases: addPurchases,
        getPurchases: getPurchases,
        initPurchaseSequence: initPurchaseSequence
    }
})()

module.exports = PurchaseDAO
