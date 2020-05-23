var Product = require('../models/product')
module.exports = {
    'lineChart': async function () {
        var arr = []
        var pro = await Product.find(async (err, docs) => {
            var month = ['0', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
            await month.forEach(m => {
                var obj = {
                    'month': m,
                    'profit': 0
                }
                docs.forEach(s => {
                    s.orderList.forEach(o => {
                        if (o.orderDate.toISOString().slice(5, 7) == m && o.status == 1) {
                            obj.profit = (obj.profit + o.totalHasDiscount)
                        }
                    })
                })
                arr.push(obj)
            })

        })
        return await arr
    },
    'pieChart': async function (totalProfit) {
        var arr = []
        var pro = await Product.find(async (err, docs) => {
            await docs.forEach(s => {
                var obj = {
                    'name': s.title + '-' + s.to + '-' + s.codeBus,
                    'percent': ((s.totalProfit / totalProfit) * 100).toFixed(1)
                }
                arr.push(obj)
            })
        })
        return await arr
    },
    'barChart': async function () {
        var arr = []
        var pro = await Product.find(async (err, docs) => {
            await docs.forEach(s => {
                console.log(s.title)
                var obj = {
                    'title': s.title + '-' + s.to + '-' + s.codeBus,
                    'values': s.totalProfit
                }

                arr.push(obj)
            })
        })
        return await arr
    },
    
}