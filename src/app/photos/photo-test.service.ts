import { ActivatedRouteSnapshot,UrlSegment } from '@angular/router';


export class PhotoTestService {
    
    public static getSnapShotForUrl(url : string) : ActivatedRouteSnapshot {
        let activatedRouteSnapshot : ActivatedRouteSnapshot = new ActivatedRouteSnapshot();
        let urlSegments : UrlSegment[] = [];
        let urls :  string [] = url.split('/');
        urls.forEach((url) => {
            let urlSegment : UrlSegment = new  UrlSegment(url,null);
            urlSegments.push(urlSegment);
        });
        activatedRouteSnapshot.url = urlSegments;
        let ret = activatedRouteSnapshot;
        return ret;
    }
}