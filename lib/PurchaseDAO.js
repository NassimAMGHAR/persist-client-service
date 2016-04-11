var config = require('../config.json')
var PurchaseModel = require('../model/Purchase')
var SequenceModel = require('../model/Sequence')
var mongoose = require('mongoose')
var PurchaseSchema = new mongoose.Schema(PurchaseModel)
var jsonRequireFields = require('json-required-fields')

var vSequenceConnection = mongoose.createConnection('mongodb://' + config.databaseURL + '/' + config.sequencesDatabaseName)
var vPurchaseConnection = mongoose.createConnection('mongodb://' + config.databaseURL + '/' + config.purchasesDatabaseName)
var SequenceSchema = new mongoose.Schema(SequenceModel)
var Sequence = vSequenceConnection.model('sequences', SequenceSchema)
var Purchase = vPurchaseConnection.model('purchases', PurchaseSchema)
var bunyan = require('bunyan')
var log = bunyan.createLogger({
  name: 'Persist Purchases Service DAO',
  streams: [{
    type: 'rotating-file',
    path: './persist-client-service-purchase.log',
    period: '1d',   // daily rotation
    count: 3        // keep 3 back copies
  }]
})

var PurchaseDAO = (function () {
  var initPurchaseSequence = function () {
    Sequence.findOneAndUpdate(
      { name: 'purchase' },
      {},
      function (pErr, pResult) {
        if (!pErr) {
          if (!pResult) {
            (new Sequence({ name: 'purchase', sequenceValue: 0 })).save(function (e) {
              e ? console.log(e) : console.log('initilized sequence')
            })
          }
        } else {
          log.error(pErr)
        }
      }
    )
  }

  var updatePurchase = function (pPurchase, pQuery, pReqBody, i, pErr, pResultCallback, pSentYet) {
    pPurchase.update(pQuery, pReqBody.purchases[i], {
      upsert: true,
      setDefaultsOnInsert: true
    }, function (pErr, numRowAffected) {
      if (pErr) {
        log.error(pErr)
      }

      if (!pSentYet.value && i >= pReqBody.purchases.length - 1) {
        if (pErr) {
          if (pErr.name === 'ValidationError') {
            pResultCallback({
              success: false,
              message: 'Another Client with the same ' +
                Object.keys(pErr.errors)[0] +
                ' already exists',
              statusCode: config.statusCodes.duplicateEntry[Object.keys(pErr.errors)[0]]
            })
          } else {
            pResultCallback({
              success: false,
              message: "Sorry, something went couldn't update the purchases"
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
    var vErr
    var vSentYet = { value: false }

    if (pReqBody.purchases.length === 0 || !pReqBody.purchases) {
      pResultCallback({
        success: false,
        message: 'You must provide at least one purchase',
        statusCode: config.statusCodes.mandatoryFieldsMissing
      })
      return false
    }

    for (var i in pReqBody.purchases) {
      var vResultPurchase = jsonRequireFields.checkReqHasFields(pReqBody.purchases[i], [
        'clientId',
        'amount',
        'productID',
        'transactionDate'
      ], '')

      if (vResultPurchase.length > 0) {
        pResultCallback({
          success: false,
          message: "Required field: '" + [vResultPurchase[0]] +
            "' is missing",
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
            } else {
              log.error(pErr)
            }
          }
        )
      }
    }
  }

  var getPurchases = function (pQuery, pResultCallback) {
    Purchase.find((pQuery.query ? JSON.parse(decodeURIComponent(pQuery.query)) : '')).sort((pQuery.sort ? pQuery.sort : '')).exec(
      function (err, pResults) {
        if (err) {
          log.error(err)
        }
        pResultCallback(pResults)
      })
  }

  var getTopNPurchases = function (pQuery, pResultCallback) {
    Purchase.aggregate([
      {
        $group: {
          _id: '$clientId',
          sumPurchases: { $sum: 'amount' }
        }
      },
      {
        $sort: {
          'sumPurchases': 1
        }
      }
    ], function (err, pResults) {
      if (err) {
        log.error(err)
      }
      pResultCallback(pResults)
    })
  }

  return {
    addPurchases: addPurchases,
    getPurchases: getPurchases,
    initPurchaseSequence: initPurchaseSequence,
    getTopNPurchases: getTopNPurchases
  }
})()

module.exports = PurchaseDAO
