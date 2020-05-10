// module.exports = {
//   'setup_nav_Pagegination': await Product.find(async (err, docs) => {
//     if (parseInt(docs.length % 10) == 0 && parseInt(docs.length / 10) > 0) {
//       totalLength = await parseInt(docs.length / 10)
//     } else if (parseInt(docs.length / 10) == 0) {
//       totalLength = 1
//     } else if (parseInt(docs.length % 10) != 0) {
//       totalLength = await parseInt((docs.length / 10) + 1)
//     }
//     res.locals.totalPagination = await totalLength
//   }),
//   'pagination': async function paginate(pages, limitNum,obj) {
//     var productChunks = []
//     await obj.paginate({}, {
//       page: pages,
//       limit: limitNum
//     }, async (err, rs) => {
//       rs.docs.forEach(s => {
//         productChunks.push(s)
//       })

//     });
//     return await productChunks
//   }
// }
// async function paginate(pages, limitNum) {
//   var productChunks = []
//   await Product.paginate({}, {
//     page: pages,
//     limit: limitNum
//   }, async (err, rs) => {
//     rs.docs.forEach(s => {
//       productChunks.push(s)
//     })

//   });
//   return await productChunks
// }