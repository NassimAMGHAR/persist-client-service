var express = require('express')
var bodyParser = require('body-parser')
var ClientDAO = require('./lib/ClientDAO')
var PurchaseDAO = require('./lib/PurchaseDAO')
var app = express()

// CORS middleware
var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')

  next()
}

// parse text/json
app.use(bodyParser.json())
app.use(allowCrossDomain)
PurchaseDAO.initPurchaseSequence()

app.post('/add-new-client', function (req, res) {
  ClientDAO.addClient(req.body, function (pResult) {
    res.json(pResult)
  })
})

app.post('/add-or-update-purchases', function (req, res) {
  PurchaseDAO.addPurchases(req.body, function (pResult) {
    res.json(pResult)
  })
})

app.post('/update-client', function (req, res) {
  ClientDAO.updateClient(req.body, function (pResult) {
    res.json(pResult)
  })
})

app.get('/get-clients', function (req, res) {
  ClientDAO.getClients(req.query, function (pResult) {
    res.json(pResult)
  })
})

app.get('/get-top-n-clients', function (req, res) {
  ClientDAO.getTopNClients(req.query, function (pResult) {
    res.json(pResult)
  })
})

app.get('/get-purchases', function (req, res) {
  PurchaseDAO.getPurchases(req.query, function (pResult) {
    res.json(pResult)
  })
})
app.listen(3000)
