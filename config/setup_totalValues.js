var Product = require('../models/product')
var User = require('../models/user')
module.exports = {
    'totalOrder_eachProduct': async function (pro_id){
        var totalOrder = 0
        await User.find({
            'role': 'Customer'
        },async(err,user)=>{
            await user.forEach(u=>{
                u.orderList.forEach(s=>{
                    var check = false
                    s.sub_order.forEach(sb=>{
                        if(sb.proId == pro_id){
                            check = true
                        }
                    })
                    if(check == true){
                        totalOrder++
                    }
                })
            }) 
        })
        return await totalOrder
    }
}