
export class PhotoTestService {
    
    public static getSnapshotForUrl(url : string) {
        console.log("PhotoTestService","url",url);
        let urls :  string [] = url.split('/');
        console.log("PhotoTestService","urls",urls);
        let urlsObjList : Object[]= [];
        urls.forEach((url) => {
            urlsObjList.push({path: url});
        });
        console.log("PhotoTestService","urlsObjList",urlsObjList);
        let ret = {url: urlsObjList};
        console.log("PhotoTestService","ret",ret);
        return ret;
    }
}