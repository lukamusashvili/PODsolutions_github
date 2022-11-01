const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const reqString = {type: String, required: true}
const reqNumber = {type: Number, required: true}
// status can be: success, sending, failure. depends if PHP side receives it or not

const ordersSchema = new Schema({
    shop: reqString,
    orderId: reqNumber,
    orderName: reqString,
    status: reqString
},{collection: 'orders', timestamps: true});

const orders = mongoose.model('orders', ordersSchema);

module.exports = orders;
