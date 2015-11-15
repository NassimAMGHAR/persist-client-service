var express = require('express'),
	bodyParser = require('body-parser')

var app = express()
// parse text/json
app.use(bodyParser.json())

app.post('/add-new-lead', function(req, res) {
	
})

app.post('/update-lead', function(req, res) {
	
})

app.listen(3000)