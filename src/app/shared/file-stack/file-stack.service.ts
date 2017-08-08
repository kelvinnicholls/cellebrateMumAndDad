import filestack from 'filestack-js';
import { Consts } from "../../shared/consts";

export class FileStackService {

    client: any;
    constructor() {
        this.client = filestack.init(Consts.FILE_PICKER_API_KEY);
    }

    showFilePicker(options): Promise<any> {
        return this.client.pick(options);
    }

}