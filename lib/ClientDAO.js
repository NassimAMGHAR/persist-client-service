var config = require('../config.json')
var ClientModel = require('../model/Client')
var mongoose = require('mongoose')
var ClientSchema = new mongoose.Schema(ClientModel)
var jsonRequireFields = require('json-required-fields')
var mongooseUniqueValidator = require('mongoose-unique-validator')
var PurchaseDAO = require('./PurchaseDAO')
var _ = require('lodash')
var bunyan = require('bunyan')
var log = bunyan.createLogger({
  name: 'Persist Purchases Service DAO',
  streams: [{
    type: 'rotating-file',
    path: './persist-client-service.log',
    period: '1d',   // daily rotation
    count: 3        // keep 3 back copies
  }]
})

ClientSchema.plugin(mongooseUniqueValidator)

mongoose.connect('mongodb://' + config.databaseURL + '/' + config.databaseName)

var Client = mongoose.model('client', ClientSchema)

var ClientDAO = (function () {
  var addClient = function (pReqBody, pResultCallback) {
    var vResult = jsonRequireFields.checkReqHasFields(pReqBody,
      [
        'title',
        'firstname',
        'lastname',
        'email',
        'birthday',
        'company',
        'budget',
        'celPhone',
        'officePhone',
        {
          'address': [
            'street',
            'zipCode',
            'city',
            'country'
          ]
        },
        'purchases',
        'complementaryNote'
      ], '')

    if (vResult.length > 0) {
      pResultCallback({
        success: false,
        message: "Required field: '" + [vResult[0]] + "' is missing",
        statusCode: config.statusCodes.mandatoryFieldsMissing
      })
      return false
    }

    var vNewClient = new Client(pReqBody)
    vNewClient.save(function (err, client) {
      if (err) {
        log.error(err)
        if (err.name === 'ValidationError') {
          pResultCallback({
            success: false,
            message: 'Another Client with the same ' + Object.keys(err.errors)[0] + ' already exists',
            statusCode: config.statusCodes.duplicateEntry[Object.keys(err.errors)[0]]
          })
        } else {
          pResultCallback({
            success: false,
            message: "Sorry, something went couldn't save the new client"
          })
        }
      } else {
        var vPurchases = []
        for (var i = 0; i < pReqBody.purchases.length; i++) {
          pReqBody.purchases[i].clientId = client._id
          vPurchases.push(pReqBody.purchases[i])
        }

        PurchaseDAO.addPurchases({ purchases: vPurchases }, function (pSuccess, pMessage) {
          if (pSuccess) {
            pResultCallback({
              success: true,
              message: 'Correctly saved the new client'
            })
          } else {
            pResultCallback({
              success: pSuccess,
              message: pMessage
            })
          }
        })
      }
    })
  }

  var updateClient = function (pReqBody, pResultCallback) {
    Client.update({ 'email': pReqBody.email }, pReqBody, {}, function (err, numAffected) {
      if (err) {
        log.error(err)
        pResultCallback({
          success: false, message: "Sorry, something went couldn't update the client"
        })
      } else {
        if (numAffected.nModified === 0) {
          pResultCallback({
            success: false,
            message: 'Nothing new',
            statusCode: config.statusCodes.noFieldUpdated
          })
        }
        if (numAffected.nModified === 1) {
          pResultCallback({
            success: true, message: 'Correctly updated the client'
          })
        }
      }
    })
  }

  var getClients = function (pQuery, pResultCallback) {
    Client.find((pQuery.query ? JSON.parse(decodeURIComponent(pQuery.query)) : ''), null, null, function (err, pResults) {
      log.error(err)
      pResultCallback(pResults)
    })
  }

  var getTopNClients = function (pQuery, pResultCallback) {
    PurchaseDAO.getTopNPurchases({'oldestDate': pQuery.oldestDate, 'limit': pQuery.limit}, function (pResult) {
      var vTopNClientsIds = _.map(pResult, function (pResultElement, pIndex) {
        return pResultElement._id
      })

      Client.find({ '_id': { '$in': vTopNClientsIds } }, null, null, function (err, pResults) {
        log.error(err)
        pResultCallback(pResults)
      })
    })
  }

  return {
    addClient: addClient,
    updateClient: updateClient,
    getClients: getClients,
    getTopNClients: getTopNClients
  }
})()

module.exports = ClientDAO
