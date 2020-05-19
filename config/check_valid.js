const Product = require('../models/product')

module.exports = {
  check_valid: async (title,to) => {
    var pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/) //unacceptable chars
    if (pattern.test(title) || pattern.test(to)) {
      // alert("Please only use standard alphanumerics");
      return false
    }
    return true //good user input
  },
  check_bus: async values => {
    var uniqueBus = await Product.findOne({ codeBus: values }, async function (
      err,
      trip
    ) {
      return trip
    })
    // console.log(uniqueBus, "abcd")
    return uniqueBus !== null ? false : true
  }
}
