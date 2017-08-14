export class Photo {

    public index;

    constructor(public title: string,
        public _creator,
        public addedDate: string,
        public _id: string,
        public description?: string,
        public photoFile?: File,
        public photoInfo?: any // {location:string,mimeType:string,isUrl:boolean,originalFileName:string,mediaDate:date}
    ) {
        if (photoInfo && photoInfo.location && !photoInfo.isUrl && photoInfo.location.startsWith('server')) {
            this.photoInfo.location = photoInfo.location.substring(14);
        };

    }

};