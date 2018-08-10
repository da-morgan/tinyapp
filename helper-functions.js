    
//Generates a random string given a length input when function is called.
const generateRandomString = function (length) {
    var options = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for (var i = 0; i < length; i++){
        result += options[Math.floor(Math.random() * options.length)];
    }
    return result;
}

    /* searches an object for values attached to anonymous keys.
    takes in an object, the value being searched for and the 
    value the user is passing in. */
const objectSearcher = function (object, objValue, userValue){
    let valueChecker = false;
    var arr = Object.keys(object);
    for(var i = 0; i < arr.length; i++){
        if(object[arr[i]][objValue] === userValue){
            valueChecker = true;
        }
    }
    return valueChecker;
}

    /* given an email and password, returns the 
    UserID attached to those credentials. */
const idGrabber = function idGrabber(object, em, pw){
    let id = false;
    var arr = Object.keys(object);

    for(var i = 0; i < arr.length; i++){
        if(object[arr[i]].email === em && bcrypt.compareSync(pw, object[arr[i]].password)){
            id = arr[i];
        }
    }
    
    return id; 
}

    /* Recreates URL database but only includes URLs
    the user is allowed to see.*/
const urlsForUser = function (id){
    let returnObj = {}
    let object; 
    for(var key in urlDatabase){
        if(id === urlDatabase[key].UserID) {
            returnObj[key] = urlDatabase[key]
        }
    }
    return returnObj;
}

module.exports =  {
    "urlsForUser": urlsForUser(),
    "idGrabber": idGrabber(),
    "objectSearcher": objectSearcher(),
    "generateRandomString": generateRandomString()
}