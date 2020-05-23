var Product = require('../models/product')
var User = require('../models/user')
module.exports = {
    'glosbeDaily': async function () {
        var today = new Date()
        var yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        var profit_today = 0;
        var profit_yesterday = 0;
        var dailySales = 0
        var obj_DailySales = {}
        var pro = await Product.find(async (err, docs) => {
            await docs.forEach(s => {
                s.orderList.forEach(x => {
                    if (x.orderDate.toISOString().slice(0, 10) == today.toISOString().slice(0, 10) && x.status == 1) {
                        profit_today += x.totalHasDiscount
                    } else if (x.orderDate.toISOString().slice(0, 10) == yesterday.toISOString().slice(0, 10) && x.status == 1) {
                        profit_yesterday += x.totalHasDiscount
                    }
                })
            })
        })

        if (profit_yesterday != 0 && profit_today == 0) {
            dailySales = -100
            obj_DailySales.dailySales = dailySales;
            obj_DailySales.icon = 'fa fa-long-arrow-down'
            obj_DailySales.color = 'text-danger'
        } else if (profit_yesterday == 0 && profit_today != 0) {
            dailySales = (profit_today / 100).toFixed(1)
            obj_DailySales.dailySales = dailySales;
            obj_DailySales.icon = 'fa fa-long-arrow-up'
            obj_DailySales.color = 'text-success'
        } else if (profit_yesterday == 0 && profit_today == 0) {
            dailySales = 0
            obj_DailySales.dailySales = dailySales;
            obj_DailySales.icon = 'fa fa-long-arrow-down'
            obj_DailySales.color = 'text-danger'
        } else if (profit_yesterday != 0 && profit_today != 0) {
            dailySales = (((profit_today - profit_yesterday) / profit_yesterday) * 100).toFixed(1)
            obj_DailySales.dailySales = dailySales;
            if (dailySales > 0) {
                obj_DailySales.icon = 'fa fa-long-arrow-up'
                obj_DailySales.color = 'text-success'
            } else {
                obj_DailySales.icon = 'fa fa-long-arrow-down'
                obj_DailySales.color = 'text-danger'
            }
        }
        return await obj_DailySales
    },
    'message_notification': async function () {
        // notification for new order
        var obj = await {
            'message': 0,
        }
        var users = await User.find({
            'role': 'Customer'
        }, async (err, users) => {
            var today = new Date()
            await Product.find(async (err, pro) => {
                var count = 0
                await users.forEach(u => {
                    var check = false
                    u.orderList.forEach(o => {
                        var check_number = false
                        if (o.orderDate.toISOString().slice(0, 10) == today.toISOString().slice(0, 10)) {
                            o.sub_order.forEach(so => {
                                so.orderNumber.forEach(no => {
                                    pro.forEach(products => {
                                        products.orderList.forEach(p => {
                                            if (p.status == 0 && products._id == so.proId && p.numberOrder == no) {
                                                check = true
                                                check_number = true
                                            }
                                        })
                                    })
                                })
                            })
                        }
                        if (check_number == true) {
                            count++
                        }
                    })
                    if (check == true) {
                        //count++
                        obj.new_order = count
                        obj.date_new = today.toISOString().slice(0, 10)
                    }
                })
                if (obj.new_order && obj.new_order != 0) {
                    obj.message = obj.message + 1
                }
            })

        })
        return await obj
        // end notification for new order
    },
    'order_pending': async function () {
        var arr = []
        var number = 0
        var users = await User.find({
            'role': 'Customer'
        }, async (err, users) => {
            var pro_duct = await Product.find(async (err, products) => {
                users.forEach(u => {
                    u.orderList.forEach(user_order => {
                        var check = false
                        var obje = {}
                        user_order.sub_order.forEach(sub_or => {
                            products.forEach(pro => {
                                if (sub_or.proId == pro._id) {
                                    sub_or.orderNumber.forEach(order_num => {
                                        pro.orderList.forEach(pro_order => {
                                            if (order_num == pro_order.numberOrder && pro_order.status == 0) {
                                                obje.orderDate = user_order.orderDate
                                                obje.email = u.email
                                                obje.status = 'Pending'
                                                obje.totalItem = sub_or.orderNumber.length
                                                obje.totalPrice = user_order.totalPrice
                                                check = true
                                            }
                                        })
                                    })
                                }
                            })
                        })
                        if (check == true) {
                            number++
                            obje.number = number
                            arr.push(obje)
                            //obj.message = obj.message + 1
                        }
                    })
                })

            })

        })
        return await number
    }
}