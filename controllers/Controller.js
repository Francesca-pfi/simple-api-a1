const Response = require('../response.js');
const queryString = require('query-string');
const encoding = require('strict-uri-encode');
const utilities = require('../utilities');
/////////////////////////////////////////////////////////////////////
// Important note about controllers:
// You must respect pluralize convention: 
// For ressource name RessourName you have to name the controller
// RessourceNamesController that must inherit from Controller class
// in order to have proper routing from request to controller action
/////////////////////////////////////////////////////////////////////
module.exports = 
class Controller {
    constructor(req, res) {
        this.req = req;
        this.res = res;
        this.response = new Response(res);
    }
    getQueryStringParams(){
        let path = utilities.decomposePath(this.req.url);
        if (path.queryString != undefined) {
            let parsed = queryString.parse(path.queryString);
            for (let key of Object.keys(parsed)) {
                if (typeof parsed[key] === "string"){
                    let trimmed = parsed[key].trim()
                    if (trimmed.trim()[0] == "\"" || trimmed.trim()[0] == "\'") {
                        parsed[key] = trimmed.substring(1,trimmed.lastIndexOf(trimmed.trim()[0]));
                    }
                }
            }
            return parsed;
        }
        return null;
    }
    queryStringParamsList() { return "";}
    get(id){
        this.response.notImplemented();
    }  
    post(obj){  
        this.response.notImplemented();
    }
    put(obj){
        this.response.notImplemented();
    }
    patch(obj){
        this.response.notImplemented();
    }
    remove(id){
        this.response.notImplemented();
    }
}