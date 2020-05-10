module.exports.formatDate = async (date) =>{
    var DateString = date.toString()
    var Arr = await DateString.split(" ");
    var DateTrip = `${Arr[0]}-${Arr[1]}-${Arr[2]}-${Arr[3]}`
    return DateTrip
}