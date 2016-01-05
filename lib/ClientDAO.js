var config = require('../config.json'),
	ClientModel = require('../model/Client'),
	mongoose = require('mongoose'),
	ClientSchema = new mongoose.Schema(ClientModel),
	async = require("async"),
	jsonRequireFields = require("json-required-fields")
	
ClientSchema.plugin(require('mongoose-unique-validator'))
mongoose.connect('mongodb://' + config.databaseURL + '/' + config.databaseName)
		
var Client = mongoose.model('client', ClientSchema)

var ClientDAO = (function() {
	
	var addClient = function(pReqBody, pResultCallback) {
		
		var vResult = jsonRequireFields.checkReqHasFields(pReqBody, 
		[
			"title",
			"firstname",
			"lastname",
			"email",
			"birthday",
			"company",
			"budget",
			"celPhone",
			"officePhone",
			{
				"address": [
					"street",
					"zipCode",
					"city",
					"country"
				]
			},
			"purchases",
			"complementaryNote"
		], '')
			
		if(vResult.length > 0) {
			pResultCallback({
						success: false, 
						message: 'Required field: \'' +  [vResult[0]] + '\' is missing',
						statusCode: config.statusCodes.mandatoryFieldsMissing
					})
			return false
		}
		
		if(pReqBody.purchases.length === 0) {
			pResultCallback({
						success: false, 
						message: 'You must provide at least one purchase',
						statusCode: config.statusCodes.mandatoryFieldsMissing
					})
			return false
		}
		
		for(var i in pReqBody.purchases) {
			var vResultPurchase = jsonRequireFields.checkReqHasFields(pReqBody.purchases[i], 
				[
					"amount",
					"productID",
					"transactionDate"
				], '')
				
			if(vResultPurchase.length > 0) {
				pResultCallback({
							success: false, 
							message: 'Required field: \'' +  [vResultPurchase[0]] + '\' is missing',
							statusCode: config.statusCodes.mandatoryFieldsMissing
						})
				return false
			}
		}
		
		var vNewClient = new Client(pReqBody)
		vNewClient.save(function (err) {
			if(err) {
				if(err.name === 'ValidationError') {
					pResultCallback({
						success: false, 
						message: 'Another Client with the same ' +  Object.keys(err.errors)[0] + ' already exists',
						statusCode: config.statusCodes.duplicateEntry[Object.keys(err.errors)[0]]
					})
				} else {
					pResultCallback({
						success: false, 
						message: 'Sorry, something went couldn\'t save the new client' 
					})
				}
			} else {
				pResultCallback({
					success: true, 
					message: 'Correctly saved the new client'
				})
			}
		})
	}
		
	var updateClient = function(pReqBody, pResultCallback) {
        var req = { $push: { "purchases" : { $each: pReqBody.purchases } } }
        if(pReqBody.title) {
            req["title"] = pReqBody.title
        }
        
        if(pReqBody.firstname) {
            req["pReqBody.firstname"] = pReqBody.firstname
        }
        
        if(pReqBody.lastname) {
           req["lastname"] = pReqBody.lastname
        }
        
        if(pReqBody.email) {
           req["email"] = pReqBody.email
        }
        
        if(pReqBody.birthday) {
           req["birthday"] = pReqBody.birthday 
        }
        
        if(pReqBody.company) {
           req["company"] = pReqBody.company
        }
        
        if(pReqBody.celPhone) {
            req["celPhone"] = pReqBody.celPhone
        }
        
        if(pReqBody.officePhone) {
           req["officePhone"] = pReqBody.officePhone
        }
        
        if(pReqBody.address) {
           req["address"] = pReqBody.address
        }
        
        if(pReqBody.complementaryNote) {
           req["complementaryNote"] = pReqBody.complementaryNote    
        }
        
		Client.update({"email": pReqBody.email}, req, {}, function(err, numAffected) {
			if(err) {
                console.log(err)
				pResultCallback({
					success: false, message: 'Sorry, something went couldn\'t update the client'
				})
			} else {
				if(numAffected.nModified === 0) {
					pResultCallback({
						success: false, 
						message: 'Nothing new',
						statusCode: config.statusCodes.noFieldUpdated
					})
				}
				if(numAffected.nModified === 1) {
					pResultCallback({
						success: true, message: 'Correctly updated the client'
					})
				}
			}
		})
	}
	
	var getClients = function(pQuery, pResultCallback) {
		Client.find(pQuery, null, null, function(err, pResults) {
			pResultCallback(pResults) 
			})
	}
	
	return {
		addClient: addClient,
		updateClient: updateClient,
		getClients: getClients
	}
})()

module.exports = ClientDAO