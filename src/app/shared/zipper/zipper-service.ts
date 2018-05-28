import { Injectable } from "@angular/core";

import * as JSZip from '../../../../node_modules/jszip/dist/jszip.js';
import * as JSZipUtils from '../../../../node_modules/jszip-utils/dist/jszip-utils.js';

import * as FileSaver from '../../../../node_modules/file-saver/FileSaver.js';
//import { Utils, LoglevelEnum, SortDataType } from "../../shared/utils/utils";

@Injectable()
export class ZipperService {

    zip: JSZip;
    constructor() {
        let zip = new JSZip();
    }

    public zipFiles(files: any) {
        this.compress(files, 'Photos')
    }



    compress = (files, nameOfZipFile) => {
        let zip = new JSZip();
        let count = 0;
        let name = nameOfZipFile + ".zip";
        files.forEach(function (file) {
            JSZipUtils.getBinaryContent(file.photoInfo.location, function (err, data) {
                if (err) {
                    throw err;
                }
                zip.file(file.photoInfo.location, data, { binary: true });
                count++;
                if (count == files.length) {
                    zip.generateAsync({ type: 'blob' }).then(function (content) {
                        FileSaver.saveAs(content, name);
                    });
                }
            });
        });
    }

}