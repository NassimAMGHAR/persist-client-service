var express = require('express'),
	bodyParser = require('body-parser'),
	ClientDAO = require('./lib/ClientDAO')
var app = express()
// parse text/json
app.use(bodyParser.json())

app.post('/add-new-client', function(req, res) {
	ClientDAO.addClient(req.body, function(pResult) {
		res.json(pResult)
	})
})

app.post('/update-client', function(req, res) {
	ClientDAO.updateClient(req.body, function(pResult) {
		res.json(pResult)
	})
})

app.listen(3000)