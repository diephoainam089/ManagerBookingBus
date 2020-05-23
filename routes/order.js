var express = require('express')
var router = express.Router()
var Product = require('../models/product')
var User = require('../models/user')
var url = require('url')
var filter = require('../config/filter_Func')

let arrFilters = []
router.get('/orderList', isLoggedIn, async (req, res) => {
  var arr = []
  await User.find(
    {
      role: 'Customer'
    },
    async (err, users) => {
      var numberStt = 0
      // Filter user role -> orderList (orderDate,totalPrice) -> sub_order (proId) -> orderNumber.
      await Product.find(async (err, products) => {
        var ticketUpdArr = []
        await users.forEach(u => {
          u.orderList.forEach(s => {
            var obj = {}
            obj.email = u.email
            numberStt++
            obj.orderDate = s.orderDate
            obj.totalPrice = s.totalPrice
            obj.totalItem = 0
            obj.id = u._id
            obj.numberOrder = s.number
            s.sub_order.forEach(sb => {
              obj.totalItem = obj.totalItem + sb.orderNumber.length
              sb.orderNumber.forEach(o => {
                products.forEach(result => {
                  result.orderList.forEach(p => {
                    if (result._id == sb.proId && p.numberOrder == o) {
                      if (p.status == 1) {
                        obj.status = 'Done'
                      } else if (p.status == 0) {
                        obj.status = 'Pending'
                      } else if (p.status == -1) {
                        obj.status = 'Cancel'
                      }
                      obj.ticketId = result._id
                      obj.ticketNumOr = p.numberOrder
                    }
                  })
                })
              })
            })
            obj.number = numberStt
            console.log(obj)
            arr.push(obj)
          })
        })
        arrFilters = await arr
        await res.render('orders/orderList', {
          orders: 'order',
          orderList: arr,
          arr_ticketUpd: ticketUpdArr,
          sessionUser: req.session.user,
          notification: req.session.messsages
        })
      })
    }
  )
})

router.get('/filter_newOrder/:date', async (req, res) => {
  var arr = []
  await User.find(
    {
      role: 'Customer'
    },
    async (err, users) => {
      var numberStt = 0
      // Filter user role -> orderList (orderDate,totalPrice) -> sub_order (proId) -> orderNumber.
      await Product.find((err, products) => {
        users.forEach(u => {
          u.orderList.forEach(s => {
            var obj = {}
            obj.email = u.email
            numberStt++
            obj.orderDate = s.orderDate
            obj.totalPrice = s.totalPrice
            // obj.totalItem = s.sub_order.length
            obj.totalItem = 0
            obj.id = u._id
            obj.numberOrder = s.number
            var check = false
            s.sub_order.forEach(sb => {
              obj.totalItem = obj.totalItem + sb.orderNumber.length
              sb.orderNumber.forEach(o => {
                products.forEach(result => {
                  result.orderList.forEach(p => {
                    if (
                      result._id == sb.proId &&
                      p.numberOrder == o &&
                      p.orderDate.toISOString().slice(0, 10) == req.params.date
                    ) {
                      if (p.status == 0) {
                        obj.status = 'Pending'
                        check = true
                      }
                    }
                  })
                })
              })
            })
            if (check == true) {
              obj.number = numberStt
              arr.push(obj)
            }
          })
        })
      })
      res.render('orders/orderList', {
        orders: 'order',
        orderList: arr,
        sessionUser: req.session.user,
        notification: req.session.messsages
      })
    }
  )
})
router.post('/filter_orderPending', async (req, res) => {
  var arr = []
  arrFilters.forEach(s => {
    if (s.status == 0) {
      arr.push(s)
    }
  })
  res.render('orders/orderList', {
    orders: 'order',
    orderList: arr,
    sessionUser: req.session.user,
    notification: req.session.messsages
  })
})
router.post('/filter_status', async (req, res) => {
  if (req.body.status == 2) {
    res.redirect('./orderList')
  } else {
    var arr = []
    arrFilters.forEach(s => {
      if (s.status == req.body.status) {
        arr.push(s)
      }
    })
    res.render('orders/orderList', {
      orders: 'order',
      orderList: arr,
      sessionUser: req.session.user,
      notification: req.session.messsages
    })
  }
})

router.get('/orderDetail/:numberOrder', async (req, res) => {
  var numOrder = req.params.numberOrder
  var arr = numOrder.split('-')
  User.findById(arr[0], (err, user) => {
    Product.find((err, product) => {
      var arrProduct = [],
        arr_proDelet = []
      var obj = {
        orderList: []
      }
      if (user.orderList && user.orderList.length > 0) {
        user.orderList.forEach(s => {
          if (s.number == arr[1]) {
            obj.totalPrice = s.totalPrice
            obj.orderDate = s.orderDate
            s.sub_order.forEach(x => {
              product.forEach(pro => {
                if (pro._id == x.proId) {
                  x.orderNumber.forEach(o => {
                    pro.orderList.forEach(p => {
                      if (o == p.numberOrder) {
                        p.tripDepart = pro.title
                        p.tripDes = pro.to
                        p.departDate = pro.departDate
                        p.region = pro.tripGroup
                        p.proPrice = pro.price
                        p.proId = pro._id
                        p.img = pro.imagePath
                        arrProduct.push(p) // view product detail
                        // setup delete product
                        var proDelete = {
                          _id: pro._id,
                          numberOrder: p.numberOrder
                        }
                        arr_proDelet.push(proDelete)
                      }
                    })
                  })
                }
              })
            })
          }
        })
        obj.userInfo = arrProduct[0].userInfo
        obj.couponCode = arrProduct[0].couponCode
        obj.orderList = arrProduct
        // console.log(obj, 'aaaa')
        if (arrProduct[0].status == 1) {
          obj.status = 'Done'
        } else if (arrProduct[0].status == 0) {
          obj.status = 'Pending'
        } else if (arrProduct[0].status == -1) {
          obj.status = 'Cancel'
        }
      }

      res.render('orders/orderDetail', {
        orders: 'order',
        orderDetail: obj,
        sessionUser: req.session.user,
        notification: req.session.messsages,
        arr_proDelet: JSON.stringify(arr_proDelet)
      })
    })
  })
})
router.post('/updSttOr/:id', async (req, res) => {
  var splitArr = req.params.id.split('-')
  // console.log(req.body.status)
  // console.log(splitArr)
  var check = false
  Product.findById(splitArr[0], (err, docs) => console.log(docs))
  Product.findOneAndUpdate(
    {
      _id: splitArr[0],
      'orderList.numberOrder': Number(splitArr[1])
    },
    {
      $set: {
        'orderList.$.status': Number(req.body.status)
      }
    },
    {
      new: true,
      upset: true
    },
    async (err, docs) => {
      // var doc = await docs
      // console.log(doc, 'abcd')
      console.log(docs,'đây là docs')
      if (docs) {
        check = true
      }
      if (check == true) {
        Product.findById(docs._id, async (err, doc) => {
          // console.log(doc,"aaaaaa")
          var totalValues = 0
          var newSeatIsBooked = doc.seatIsBooked
          var newSeatLength = doc.seats
          // console.log(newSeatIsBooked, 'Before')
          // console.log(newSeatLength, 'Before')
          doc.orderList.forEach(p => {
            if (p.status === 1 && p.totalHasDiscount) {
              console.log(p.totalHasDiscount)
              totalValues += p.totalHasDiscount
            }
          })
          // console.log(totalValues)
          // Set seatIsBooked when order is canceled
          var order_cancel = doc.orderList.filter(order => order.numberOrder === Number(splitArr[1]))
          // console.log(order_cancel,"bbbbb");
          if (order_cancel[0].status == -1) {
            // console.log(order_cancel[0].seats.length)
            newSeatIsBooked.forEach(async s => {
              var exist = order_cancel[0].seats.indexOf(s)
              // console.log(exist, 'đây là exist')
              if (exist > -1) {
                newSeatIsBooked = await newSeatIsBooked.splice(
                  newSeatIsBooked.indexOf(s),
                  order_cancel[0].seats.length
                )
              }
            })
            newSeatLength = newSeatLength + order_cancel[0].seats.length
          }
          // console.log(newSeatIsBooked, 'After')
          // console.log(newSeatLength, 'After')
          // console.log(totalValues,'aaaaaaaa')
          Product.findByIdAndUpdate(
            docs._id,
            {
              $set: {
                totalProfit: totalValues,
                seatIsBooked: newSeatIsBooked,
                seats: newSeatLength
              }
            },
            {
              upset: true,
              new: true
            },
            (err, products) => {
              // console.log(products)
            }
          )
        })
      }
    }
  )

  res.redirect('../orderList')
})
router.post('/updateStatus_Order', async (req, res) => {
  var arr_proDelet = JSON.parse(req.body.arrPro)
  console.log(arr_proDelet, 'abc')
  // forEeach find proId -> get old status + profit -> findoneandUpdate -> update status
  await arr_proDelet.forEach(arr => {
    var check = false
    Product.findOneAndUpdate(
      {
        _id: arr._id,
        'orderList.numberOrder': arr.numberOrder
      },
      {
        $set: {
          'orderList.$.status': Number(req.body.status)
        }
      },
      {
        new: true,
        upsert: true
      },
      (err, docs) => {
        if (docs) {
          check = true
        }
        if (check == true) {
          Product.findById(arr._id, async (err, doc) => {
            var totalValues = 0
            var newSeatIsBooked = doc.seatIsBooked
            var newSeatLength = doc.seats
            console.log(newSeatIsBooked, 'Before')
            console.log(newSeatLength, 'Before')
            doc.orderList.forEach(p => {
              if (p.status == 1) {
                totalValues += p.totalHasDiscount
              }
            })

            // Set seatIsBooked when order is canceled
            var order_cancel = doc.orderList.filter(order => {
              if (order.numberOrder === arr.numberOrder) return order
            })
            if (order_cancel[0].status == -1) {
              console.log(order_cancel[0].seats.length)
              newSeatIsBooked.forEach(async s => {
                var exist = order_cancel[0].seats.indexOf(s)
                console.log(exist, 'đây là exist')
                if (exist > -1) {
                  newSeatIsBooked = await newSeatIsBooked.splice(
                    newSeatIsBooked.indexOf(s),
                    order_cancel[0].seats.length
                  )
                }
              })
              newSeatLength = newSeatLength + order_cancel[0].seats.length
            }
            console.log(newSeatIsBooked, 'After')
            console.log(newSeatLength, 'After')

            Product.findByIdAndUpdate(
              arr._id,
              {
                $set: {
                  totalProfit: totalValues,
                  seatIsBooked: newSeatIsBooked,
                  seats: newSeatLength
                }
              },
              {
                upsert: true,
                new: true
              },
              (err, products) => {}
            )
          })
        }
      }
    )
  })
  await res.redirect('./orderList')
})

module.exports = router

function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  req.session.oldUrl = req.url
  res.redirect('/user/signin')
}
