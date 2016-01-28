var express = require('express'),
	bodyParser = require('body-parser'),
	ClientDAO = require('./lib/ClientDAO'),
    PurchaseDAO = require('./lib/PurchaseDAO')
var app = express()
// parse text/json
app.use(bodyParser.json())
PurchaseDAO.initPurchaseSequence()

app.post('/add-new-client', function(req, res) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

	ClientDAO.addClient(req.body, function(pResult) {
		res.json(pResult)
	})
})

app.post('/add-or-update-purchases', function(req, res) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
	PurchaseDAO.addPurchases(req.body, function(pResult) {
		res.json(pResult)
	})
})

app.post('/update-client', function(req, res) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
	ClientDAO.updateClient(req.body, function(pResult) {
		res.json(pResult)
	})
})

app.get('/get-clients', function(req, res) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
	ClientDAO.getClients(req.query, function(pResult) {
		res.json(pResult)
	})
})

app.get('/get-purchases', function(req, res) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
	PurchaseDAO.getPurchases(req.query, function(pResult) {
		res.json(pResult)
	})
})
app.listen(3000)