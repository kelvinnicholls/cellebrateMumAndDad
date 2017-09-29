import * as moment from 'moment';
export class Utils  {
    public static dynamicSort(property,dataType? : SortDataType = SortDataType.String, format?: string) {
        var sortOrder = 1;
        if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a,b) {
            var result = 0;
            if (dataType === SortDataType.String) {
                 result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            } else if (dataType === SortDataType.Moment) {
                result = (moment(a[property],format) < moment(b[property],format)) ? -1 : (moment(a[property],format) > moment(b[property],format)) ? 1 : 0;
            };
            
            return result * sortOrder;
        }
    }
  }

  export enum SortDataType {
    String
    ,Moment
}