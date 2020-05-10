var express = require('express')
var router = express.Router()
var Product = require('../models/product')
var User = require('../models/user')
var csrf = require('csurf')
var passport = require('passport')

router.post('/filterEmail', function (req, res, next) {
  if (req.body.email && req.body.email.trim()) {
    User.find(
      {
        email: {
          $regex: req.body.email,
          $options: 'i'
        }
      },
      async (err, doc) => {
        var number = 1
        doc.forEach(x => {
          x.number = number
          number++
        })
        await res.render('user/userList', {
          users: doc,
          person: 'person',
          sessionUser: req.session.user,
          notification: req.session.messsages
          // csrfToken: req.csrfToken(),
        })
      }
    )
  } else {
    res.redirect('userList/1')
  }
})

var csurfProtection = csrf()
router.use(csurfProtection)
//isLoggedIn

router.get('/userList/:page', isLoggedIn, async (req, res) => {
  await User.paginate(
    {},
    {
      // pagination
      page: req.params.page,
      limit: 10
    },
    async (err, rs) => {
      var docs = rs.docs
      var numberOrder = (Number(req.params.page) - 1) * 10 + 1
      for (var i = 0; i < docs.length; i++) {
        docs[i].number = numberOrder
        numberOrder++
      }
      res.render('user/userList', {
        users: docs,
        person: 'person',
        sessionUser: req.session.user,
        notification: req.session.messsages
      })
    }
  )
})

router.get('/signup/:id', isLoggedIn, function (req, res, next) {
  var user = req.session.user
  var messages = req.flash('error')
  if (req.params.id != 'new') {
    User.findById(req.params.id, (err, doc) => {
      var orderList_user = []
      var birthday = ''
      if (doc.birthday) {
        var birthday = doc.birthday.toISOString().slice(0, 10)
      }
      if (doc.role == 'Customer') {
        doc.orderList.forEach(s => {
          // setup view order list by date
          var obj_orders = {}
          obj_orders.orderDate = s.orderDate.toISOString().slice(0, 19)
          obj_orders.number = s.number
          obj_orders.email = doc.email
          obj_orders.id = doc._id
          orderList_user.push(obj_orders)
          // end setup view order list by date
        })
      }
  
      res.render('user/signup', {
        users: doc,
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0,
        userBirth: birthday,
        person: 'person',
        orderList: orderList_user,
        sessionUser: req.session.user,
        notification: req.session.messsages
      })
    })
  } else {
        console.log(req.session.user)
    res.render('user/signup', {
      csrfToken: req.csrfToken(),
      messages: messages,
      hasErrors: messages.length > 0,
      person: 'person',
      sessionUser: req.session.user,
      notification: req.session.messsages
    })

    // res.redirect('../signup')
  }
})

router.post(
  '/signup',
  passport.authenticate('local.signup', {
    failureRedirect: './signup/new',
    failureFlash: true
  }),
  function (req, res, next) {
    console.log(req.session.user)
    if (req.session.oldUrl) {
      var oldUrl = req.session.oldUrl
      req.session.oldUrl = null
      res.redirect(oldUrl)
    } else {
      res.redirect('../user/userList/1')
    }
  }
)

router.post('/userUpl/:id', (req, res) => {
  User.findOneAndUpdate(
    {
      _id: req.params.id
    },
    {
      $set: {
        fullName: req.body.fullName,
        status: req.body.status,
        role: req.body.role,
        company: req.body.company,
        phoneNum: req.body.phoneNum,
        address: req.body.address,
        description: req.body.description,
        birthday: req.body.birthday
      }
    },
    {
      upsert: true,
      new: true
    },
    async (err, doc) => {
      if (doc.role == 'Customer' && doc.orderList.length > 0) {
          await Product.updateMany(
            {
              'orderList.userInfo.email': doc.email
            },
            {
              $set: {
                'orderList.$.userInfo.name': req.body.fullName,
                'orderList.$.userInfo.phoneNum': req.body.phoneNum,
                'orderList.$.userInfo.address': req.body.address
              }
            },
            {
              upsert: true,
              new: true
            },
            (errs, rs) => {}
          )
      }
      await res.redirect('../userList/1')
    }
  )
})

router.get('/logout', isLoggedIn, function (req, res, next) {
  req.logOut()
  req.session.user = null
  res.redirect('/')
})

router.use('/', notLoggedIn, function (req, res, next) {
  next()
})

router.get('/signin', function (req, res, next) {
  var messages = req.flash('error')
  res.render('user/signin', {
    csrfToken: req.csrfToken(),
    messages: messages,
    hasErrors: messages.length > 0,
    layout: false
  })
})

router.post(
  '/signin',
  passport.authenticate('local.signin', {
    failureRedirect: './signin',
    failureFlash: true
  }),
  function (req, res, next) {
    if (req.session.oldUrl) {
      var oldUrl = req.session.oldUrl
      req.session.oldUrl = null
      res.redirect(oldUrl)
    } else {
      res.redirect('./user/userList')
    }
  }
)

module.exports = router

function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/')
}

function notLoggedIn (req, res, next) {
  if (!req.isAuthenticated()) {
    return next()
  }
  res.redirect('/')
}
