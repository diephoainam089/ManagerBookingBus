var express = require('express');
var router = express.Router();
var Coupons = require('../models/coupon')
const multer = require('multer');
const nodemailer = require('nodemailer');
var fs = require('fs')
const csv = require('fast-csv');


var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'up-download/uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});
var upload = multer({ //multer settings
    storage: storage,
});

router.get('/download_Template', function (req, res, next) {
    const file = 'up-download/download_template/template.csv';
    res.download(file); // Set disposition and send it.
});


router.post('/read_csv', upload.single('file'), (req, res) => {
    var fileRows = [],
        fileHeader;
    csv.fromPath(req.file.path).on("data", function (data) {

        fileRows.push(data); // push each row
    }).on("end", function () {
        fs.unlinkSync(req.file.path); // remove temp file
        //process "fileRows"
        for (var i = 1; i < fileRows.length; i++) {
            var local = fileRows[i]
            var coupons = new Coupons({
                discount: (local[1] / 100),
                description: local[1] + ' %',
                active: true,
            })
            coupons.save();
            var obj = {
                'email': local[0],
                'discount': local[1] + ' %',
                'code': coupons._id
            }
            var content = `
            <p>- We send you a gift as a tribute</p>
            <h3>Gifts Details</h3>
            <ul>
                <li>Email: ${obj.email}.</li>
                <li>Start Date: ${new Date()}.</li>
                <li>Discount value: ${local[1]} %</li>
                <li>Discount Code:${coupons._id}</li>
            </ul>
            `;
            sendMail(content, 'Customer Gratitude', obj.email)
        }
    })

    res.redirect('../coupon/couponList/1')
})

router.post('/filter', async (req, res) => {
    Coupons.find({
        'active': req.body.status
    }, (err, docs) => {
        if (req.body.status == 0) {
            res.redirect('./couponList/1')
        } else {
            for (var i = 0; i < docs.length; i++) {
                docs[i].number = (i + 1)
                if (docs[i].active == true) {
                    docs[i].status = 'Active'
                } else {
                    docs[i].status = 'inActive'
                }
            }
            res.render('coupon/couponList', {
                coupons: docs,
                coupon: 'coupon',
                sessionUser: req.session.user,
                notification: req.session.messsages
            })
        }

    })
})

router.get('/couponList/:page', isLoggedIn, async (req, res) => {
    await Coupons.paginate({}, { // pagination
        page: req.params.page,
        limit: 10
    }, async (err, rs) => {
        var docs = rs.docs
        var numberOrder = (Number(req.params.page) - 1) * 10 + 1
        for (var i = 0; i < docs.length; i++) {
            docs[i].number = numberOrder
            numberOrder++
            if (docs[i].active == true) {
                docs[i].status = 'Active'
            } else {
                docs[i].status = 'inActive'
            }
        }
        res.render('coupon/couponList', {
            coupons: docs,
            coupon: 'coupon',
            sessionUser: req.session.user,
            notification: req.session.messsages
        })
    })
})
router.get('/couponDetail/:id', (req, res) => {
    if (req.params.id == 'new') {
        res.render('coupon/couponUpload', {
            coupon: 'coupon',
            sessionUser: req.session.user,
            notification: req.session.messsages
        })
    } else {
        Coupons.findById(req.params.id, (err, doc) => {
            doc.discount = doc.discount * 100
            res.render('coupon/couponUpload', {
                coupons: doc,
                coupon: 'coupon',
                sessionUser: req.session.user,
                notification: req.session.messsages
            })
        })
    }
})
router.post('/couponUpload/:id', (req, res) => {
    if (req.params.id == 'new') {
        for (var i = 0; i < req.body.quantity; i++) {
            var coupons = new Coupons({
                discount: (req.body.discount / 100),
                description: req.body.description,
                active: req.body.active,
            })
            coupons.save();
        }
    } else {
        Coupons.findOneAndUpdate({
            '_id': req.params.id
        }, {
            $set: {
                'description': req.body.description,
                'discount': (req.body.discount / 100),
                'active': req.body.active
            }
        }, {
            upsert: true,
            new: true
        }, (err, doc) => {

        })
    }
    res.redirect('../couponList/1')
})


module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}
async function sendMail(content, title, emailTo) {
    let transporter = nodemailer.createTransport({
        host: 'mail.google.com',
        service: "Gmail",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'hoainam.pt642@gmail.com', // generated ethereal user
            pass: 'Pt12345@' // generated ethereal password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: `"${title}" <foo@example.com>`, // sender address
        to: `BFT Company, ${emailTo}`, // list of receivers
        subject: 'BFT Services', // Subject line
        text: 'Dear customer', // plain text body
        html: content // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}