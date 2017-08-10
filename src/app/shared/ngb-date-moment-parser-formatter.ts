import {NgbDateParserFormatter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

// https://stackoverflow.com/questions/39546645/ng-bootstrap-is-it-correct-to-implement-a-custom-ngbdateparserformatter-to-chan
export class NgbDateMomentParserFormatter extends NgbDateParserFormatter {
    constructor(public momentFormat: string, public momentDBFormat: string) {
        super();
    };
    format(date: NgbDateStruct): string {
        if (date == null) {
            return '';
        }
        let d = moment({ year: date.year, 
                         month: date.month - 1, 
                         date: date.day });
        return d.isValid() ? d.format(this.momentFormat) : '';
    }

    formatForDB(date: NgbDateStruct): string {
        if (date == null) {
            return '';
        }
        let d = moment({ year: date.year, 
                         month: date.month - 1, 
                         date: date.day });
        return d.isValid() ? d.format(this.momentDBFormat) : '';
    }


    parse(value: string): NgbDateStruct {
        if (!value) {
            return null;
        }
        let d = moment(value, this.momentFormat);
        return d.isValid() ? { year: d.year(), 
                               month: d.month() + 1, 
                               day: d.date() } : null;
    }
}