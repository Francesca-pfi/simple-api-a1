const utilities = require('./../utilities');
const queryString = require('query-string');
const Repository = require('../models/Repository');
const { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } = require('constants');
const { isError } = require('util');

module.exports = 
class BookmarksController extends require('./Controller') {
    constructor(req, res){
        super(req, res);
        this.bookmarksRepository = new Repository('Bookmarks');
        this.sortParams = ["name", "category"];
        this.filters = {
            "name": (bookmarks, params) => this.filterBy(bookmarks, "Name", params.name), 
            "category": (bookmarks, params) => this.filterBy(bookmarks, "Category", params.category), 
            "sort": (bookmarks, params) => {
                if (this.sortParams.includes(params.sort.toLowerCase())){
                    let attr = utilities.capitalizeFirstLetter(params.sort.toLowerCase());
                    return bookmarks.sort((a,b) => (a[attr] > b[attr]) ? 1 : ((b[attr] > a[attr]) ? -1 : 0)); 
                } 
                else {
                    return this.errorGet(params, "Not a valid parameter for 'sort'");
                }
            }};
    }
    errorCreate(bookmark, message){
        let res = { "bookmark": bookmark, "error" : message};
        this.response.JSON(res);
        return false;
    }
    errorGet(params, message){
        let res = { "params": params, "error" : message};
        this.response.JSON(res);
        return false;
    }
    // GET: api/bookmarks
    // GET: api/bookmarks/{id}
    get(id){
        let params = this.getQueryStringParams();
        if(!isNaN(id))
            this.response.JSON(this.bookmarksRepository.get(id));
        else if (params === null) {
            this.response.JSON(this.bookmarksRepository.getAll());
        }
        else if (Object.keys(params).length === 0)
            this.help();
        else 
        {
            let bookmarks = this.bookmarksRepository.getAll();
            bookmarks = this.applyParams(bookmarks, params);
            if (bookmarks !== false)
                this.response.JSON(bookmarks);
        }
    }
    // POST: api/bookmarks body payload[{"Id": 0, "Name": "...", "Url": "...", "Category": "..."}]
    post(bookmark){  
        if (this.validateBookmark(bookmark)) {
            let newBookmark = this.bookmarksRepository.add(bookmark);
            if (newBookmark) {
                this.response.created(newBookmark);
            }
            else
                this.response.internalError();
        }
        else 
            this.response.badRequest();
    }
    // PUT: api/bookmarks body payload[{"Id":..., "Name": "...", "Url": "...", "Category": "..."}]
    put(bookmark){
        if (this.validateBookmark(bookmark)) {
            if (this.bookmarksRepository.update(bookmark)) {
                
                    this.response.ok();
            }
            else 
                this.response.notFound();
        }
    }
    // DELETE: api/bookmarks/{id}
    remove(id){
        if (this.bookmarksRepository.remove(id))
            this.response.accepted();
        else
            this.response.notFound();
    }
    help() {
        // expose all the possible query strings
        let content = "<div style=font-family:arial>";
        content += "<h3>GET : api/bookmarks endpoint  <br> List of possible query strings:</h3><hr>";
        content += "<h4>***Note that the parameters 'sort', 'name' and 'category' can be combined***</h4>";
        content += "<h4>? sort = name <br>returns list of bookmarks ordered alphabetically by name </h4>";
        content += "<h4>? sort = category <br>returns list of bookmarks ordered alphabetically by category </h4>";
        content += "<h4>? name = abc <br>returns list of bookmarks whose name matches given name </h4>";
        content += "<h4>? name = ab* <br>returns list of bookmarks whose name starts with given string </h4>";
        content += "<h4>? category = abc <br>returns list of bookmarks whose category matches given string</h4>";
        content += "<h4>? category = ab* <br>returns list of bookmarks whose category starts with given string</h4>";
        this.res.writeHead(200, {'content-type':'text/html'});
        this.res.end(content) + "</div>";
    }
    validateBookmark(bookmark) {
        let res = false;
        if ('Name' in bookmark && 'Url' in bookmark && 'Category' in bookmark)
            if (!this.isEmpty(bookmark.Name) && !this.isEmpty(bookmark.Url) && !this.isEmpty(bookmark.Category))
                if (Object.keys(bookmark).length <= 4)
                    if (this.isValidHttpUrl(bookmark.Url))
                        return true;
                    else return this.errorCreate(bookmark, "Invalid URL")
                else return this.errorCreate(bookmark, "Too many keys")
            else return this.errorCreate(bookmark, "Empty parameter not allowed")
        else return this.errorCreate(bookmark, "Missing parameter")
    }
    applyParams(bookmarks, params) {
        for (let param of Object.keys(params))
        {
            if (param in this.filters) {
                if (typeof params[param] == "string")
                    bookmarks = this.filters[param](bookmarks, params);
                else {
                    this.errorGet(params, "Invalid value for: " + param)
                    return false;
                }
            }
            else {
                this.errorGet(params, "Invalid parameter: " + param)
                return false;
            }
        }
        return bookmarks;
    }
    isEmpty(str) {
        return (str.length === 0 || !str.trim());
    };
    isValidHttpUrl(string) {
        let url;
        try {
          url = new URL(string);
        } catch (_) {
          return false;
        }
      
        return url.protocol === "http:" || url.protocol === "https:";
    }
    filterBy(array, property, match) {
        if (match[match.length-1]){
            return array.filter(obj => obj[property].toLowerCase().match(new RegExp("^" + match.toLowerCase().substring(0, match.length-1))))
        }
        else return array.filter(obj => obj[property].toLowerCase() == match.toLowerCase())

    }
}