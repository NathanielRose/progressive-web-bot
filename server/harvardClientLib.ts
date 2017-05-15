module HarvardArtMuseums {
    const fallbackKey = "e4f1e400-08da-11e7-ad3b-f39f51a45af0";

    interface HttpHeader {
        name: string;
        value: string;
    }

    interface Painting {
        dated: number;
        description: string;
        medium: string;
        provenance: string;
        title: string;
        people: Painter;
        image: PaintingImage;
    }

    interface Painter {
        birthplace: string;
        culture: string;
        deathplace: string;
        diplaydate: string;
        name: string;
        personid: number;
    }

    interface PaintingImage {
        baseimageurl: string;
        iiifbaseuri: string;
    }

    export class Client {  
        private _key: string;
        private _baseUrl = "http://api.harvardartmuseums.org/object?apikey=";

        constructor(key?: string) {
            if (key) {
                this._key = key;
            }
            else {
                this._key = fallbackKey;
            }
            this._baseUrl += this._key;
        }

        public async searchFor(query: string, callback: (paintings: Painting[]) => any) {
            let paintings: Painting[] = [];
            let queryUrl = this._baseUrl + "&q=" + query + "&worktype=238&fields=dated,description,medium,provenance,title,people,images&size=40";

            let jsonResult = await this.makeHttpRequest("GET", queryUrl);
            let result = JSON.parse(jsonResult);

            if (result.records) {
                result.records.forEach((record:any) => {
                    let newPainting: Painting = <Painting>{};
                    newPainting.dated = record.dated;
                    newPainting.description = record.description;
                    newPainting.provenance = record.provenance;
                    newPainting.title = record.title;
                    if (record.images && record.images.length > 0) {
                        newPainting.image = <PaintingImage>{};
                        newPainting.image.baseimageurl = record.images[0].baseimageurl;
                        newPainting.image.iiifbaseuri = record.images[0].iiifbaseuri;
                    }
                    if (record.people && record.people.length > 0) {
                        newPainting.people = <Painter>{};
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
        }

        public async makeHttpRequest(actionType: string, url: string, isArrayBuffer: boolean = false, optionalHeaders?: HttpHeader[], dataToSend?:any): Promise<any> {
            return new Promise<any>((resolve, reject) => {
                var xhr = new XMLHttpRequest();

                if (isArrayBuffer) {
                    xhr.responseType = 'arraybuffer';
                }

                xhr.onreadystatechange = function (event) {
                    if (xhr.readyState !== 4) return;
                    if (xhr.status >= 200 && xhr.status < 300) {
                        if (!isArrayBuffer) {
                            resolve(xhr.responseText);
                        }
                        else {
                            resolve(xhr.response);
                        }
                    } else {
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
                    reject(ex)
                }
            });
        }
    }
}