import LightningDatatable from 'lightning/datatable';
import customPicklistTemplate from './customPicklist.html';

export default class DatatablePicklist extends LightningDatatable {
    static customTypes = {
        picklist: {
            template: customPicklistTemplate,
            standardCellLayout: true,
            typeAttributes: ['options', 'value', 'context']
        }
    };
}