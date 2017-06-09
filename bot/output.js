var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var HarvardArtMuseums;
(function (HarvardArtMuseums) {
    var fallbackKey = "e4f1e400-08da-11e7-ad3b-f39f51a45af0";
    var Client = (function () {
        function Client(key) {
            this._baseUrl = "http://api.harvardartmuseums.org/object?apikey=";
            if (key) {
                this._key = key;
            }
            else {
                this._key = fallbackKey;
            }
            this._baseUrl += this._key;
        }
        Client.prototype.searchFor = function (query, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var paintings, queryUrl, jsonResult, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            paintings = [];
                            queryUrl = this._baseUrl + "&q=" + query + "&worktype=238&fields=dated,description,medium,provenance,title,people,images&size=40";
                            return [4 /*yield*/, this.makeHttpRequest("GET", queryUrl)];
                        case 1:
                            jsonResult = _a.sent();
                            result = JSON.parse(jsonResult);
                            if (result.records) {
                                result.records.forEach(function (record) {
                                    var newPainting = {};
                                    newPainting.dated = record.dated;
                                    newPainting.description = record.description;
                                    newPainting.provenance = record.provenance;
                                    newPainting.title = record.title;
                                    if (record.images && record.images.length > 0) {
                                        newPainting.image = {};
                                        newPainting.image.baseimageurl = record.images[0].baseimageurl;
                                        newPainting.image.iiifbaseuri = record.images[0].iiifbaseuri;
                                    }
                                    if (record.people && record.people.length > 0) {
                                        newPainting.people = {};
                                        newPainting.people.birthplace = record.people[0].birthplace;
                                        newPainting.people.culture = record.people[0].culture;
                                        newPainting.people.deathplace = record.people[0].deathplace;
                                        newPainting.people.diplaydate = record.people[0].diplaydate;
                                        newPainting.people.name = record.people[0].name;
                                        newPainting.people.personid = record.people[0].personid;
                                    }
                                    paintings.push(newPainting);
                                });
                            }
                            callback(paintings);
                            return [2 /*return*/];
                    }
                });
            });
        };
        Client.prototype.makeHttpRequest = function (actionType, url, isArrayBuffer, optionalHeaders, dataToSend) {
            if (isArrayBuffer === void 0) { isArrayBuffer = false; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var xhr = new XMLHttpRequest();
                            if (isArrayBuffer) {
                                xhr.responseType = 'arraybuffer';
                            }
                            xhr.onreadystatechange = function (event) {
                                if (xhr.readyState !== 4)
                                    return;
                                if (xhr.status >= 200 && xhr.status < 300) {
                                    if (!isArrayBuffer) {
                                        resolve(xhr.responseText);
                                    }
                                    else {
                                        resolve(xhr.response);
                                    }
                                }
                                else {
                                    reject(xhr.status);
                                }
                            };
                            try {
                                xhr.open(actionType, url, true);
                                if (optionalHeaders) {
                                    optionalHeaders.forEach(function (header) {
                                        xhr.setRequestHeader(header.name, header.value);
                                    });
                                }
                                if (dataToSend) {
                                    xhr.send(dataToSend);
                                }
                                else {
                                    xhr.send();
                                }
                            }
                            catch (ex) {
                                reject(ex);
                            }
                        })];
                });
            });
        };
        return Client;
    }());
    HarvardArtMuseums.Client = Client;
})(HarvardArtMuseums || (HarvardArtMuseums = {}));
