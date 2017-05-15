var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var HarvardArtMuseums;
(function (HarvardArtMuseums) {
    const fallbackKey = "e4f1e400-08da-11e7-ad3b-f39f51a45af0";
    class Client {
        constructor(key) {
            this._baseUrl = "http://api.harvardartmuseums.org/object?apikey=";
            if (key) {
                this._key = key;
            }
            else {
                this._key = fallbackKey;
            }
            this._baseUrl += this._key;
        }
        searchFor(query, callback) {
            return __awaiter(this, void 0, void 0, function* () {
                let paintings = [];
                let queryUrl = this._baseUrl + "&q=" + query + "&worktype=238&fields=dated,description,medium,provenance,title,people,images&size=40";
                let jsonResult = yield this.makeHttpRequest("GET", queryUrl);
                let result = JSON.parse(jsonResult);
                if (result.records) {
                    result.records.forEach((record) => {
                        let newPainting = {};
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
            });
        }
        makeHttpRequest(actionType, url, isArrayBuffer = false, optionalHeaders, dataToSend) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => {
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
                            optionalHeaders.forEach((header) => {
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
                });
            });
        }
    }
    HarvardArtMuseums.Client = Client;
})(HarvardArtMuseums || (HarvardArtMuseums = {}));
//# sourceMappingURL=harvardClientLib.js.map