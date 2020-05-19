const multer = require('multer')
const Trip = require('../models/product')
module.exports.uploadImage = type => {
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `./public/images/${type}s`)
    },
    filename: function (req, file, cb) {
      var check = undefined
      Trip.find({ imagePath: file.oringinalname }, (err, rs) => {
        check = rs
      })
      console.log(check)
      if (check === undefined) return cb(null, `${file.originalname}`)
    }
  })

  var upload = multer({ storage: storage })
  return upload.single(type)
}
