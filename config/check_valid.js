module.exports = {
    'check_valid': async (values) => {
        var pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/); //unacceptable chars
        if (pattern.test(values)) {
            // alert("Please only use standard alphanumerics");
            return false;
        }
        return true; //good user input
    }
}