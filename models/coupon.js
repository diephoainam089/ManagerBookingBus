var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate')
var Schema = mongoose.Schema;
var schema = new Schema({
    discount: {type: Number, required: true},
    description: {type: String},
    active: {type:Boolean,require:true}
})
schema.plugin(mongoosePaginate);
module.exports = mongoose.model('Coupon',schema);