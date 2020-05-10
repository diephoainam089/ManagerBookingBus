var Product = require('../models/product')
module.exports = {
    'filter_rangeDate': async (start_date, end_date) => {
        var arr = []
        var pro = await Product.find(async (err, docs) => {
            await docs.forEach(s => {
                var obj = {
                    'title': s.title,
                    'values': 0
                }
                s.orderList.forEach(x => {
                    var order_date = x.orderDate.toISOString().slice(0, 10)
                    if (order_date >= start_date && order_date <= end_date && x.status == 1) {
                        obj.values += x.totalHasDiscount
                    } else if (order_date >= start_date && !end_date && x.status == 1) {
                        obj.values += x.totalHasDiscount
                    } else if (!start_date && order_date <= !end_date && x.status == 1) {
                        obj.values += x.totalHasDiscount
                    } else if (!start_date && !end_date && x.status == 1) {
                        obj.values += x.totalHasDiscount
                    }
                })
                arr.push(obj)
            })
        })
        return await arr
    },
    'filter_month': async (month) => {
        var arr = []
        var pro = await Product.find(async (err, docs) => {
            await docs.forEach(s => {
                var obj = {
                    "qty": 0,
                    "price": 0,
                    "order": 0
                }
                s.orderList.forEach(x => {
                    if (x.orderDate.toISOString().slice(5, 7) == month && x.status == 1) {
                        obj.qty += x.totalQuantity
                        obj.price += x.totalHasDiscount
                        obj.order++
                    }
                    x.orderDate.toISOString().slice(5, 7)
                })
                arr.push(obj)
            })
        })
        return await arr
    },
    'filter_status': async (status) => {
        var arr = []
        var number = 0
        var pro = await Product.find(async (err, docs) => {
            await docs.forEach(s => {
                s.orderList.forEach(x => {
                    if (x.status == status) {
                        x.number = number + 1;
                        x.title = s.title;
                        x.category = s.tripGroup;
                        x.id = s._id;
                        if (x.status == 1) {
                            x.status = 'Done'
                            x.totalPrice = x.totalHasDiscount
                            // if (x.couponCode.discount) {
                            //     x.totalPrice -= (x.totalPrice * x.couponCode.discount)
                            // }
                        } else if (x.status == -1) {
                            x.status = 'Cancel'
                            x.totalPrice = 0
                        } else if (x.status == 0) {
                            x.status = 'Pending'
                            x.totalPrice = 0
                        }
                        arr.push(x)
                        number++;
                    }
                })
            })
        })
        return await arr
    },
    'filter_oneDate': async (date) => {
        var arr = []
        var number = 0
        var pro = await Product.find(async (err, docs) => {
            await docs.forEach(s => {
                s.orderList.forEach(x => {
                    if (x.orderDate.toISOString().slice(0, 10) == date && x.status == 0) {
                        x.number = number + 1;
                        x.title = s.title;
                        x.category = s.userGroup;
                        x.id = s._id;
                        x.status = 'Pending'
                        x.totalPrice = 0
                        arr.push(x)
                        number++;
                    }
                })
            })
        })
        return await arr
    },
    'sort_star': async function (){
        var arr = []
        var pro = await Product.find().sort({
            productRate: -1
          }).limit(5).exec(async (err, rs) => {
            var i = 1;
            await rs.forEach(s => {
              s.number = i
              i++
            })
            arr = await rs
            // return await arr  
        })
        return await arr
          
    }
}