const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const reqString = {type: String, required: true}
// status can be: active, inactive. depends on payments on PHP paypal side

const shopsSchema = new Schema({
    shop: reqString,
    token: reqString,
    status: reqString,
    ownerName: reqString,
    company: reqString,
    email: reqString,
    webhookID: reqString
},{collection: 'shops', timestamps: true});

const shops = mongoose.model('shops', shopsSchema);

module.exports = shops;
