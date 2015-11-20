var express = require('express'),
	bodyParser = require('body-parser'),
	ClientDAO = require('./lib/ClientDAO')
var app = express()
// parse text/json
app.use(bodyParser.json())

app.post('/add-new-lead', function(req, res) {
	ClientDAO.addClient(req.body, function(pResult) {
		res.json(pResult)
	})
})

app.post('/update-lead', function(req, res) {
	
})

app.listen(3000)