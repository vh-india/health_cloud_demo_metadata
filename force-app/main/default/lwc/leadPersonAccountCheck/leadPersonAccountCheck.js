import { LightningElement, api, wire, track } from 'lwc';
import checkLinkedPersonAccount from '@salesforce/apex/LeadPersonAccountController.checkLinkedPersonAccount';

export default class LeadPersonAccountCheck extends LightningElement {
    @api recordId;
    @track status;
    @track account;

    @wire(checkLinkedPersonAccount, { leadId: '$recordId' })
    wiredData({ error, data }) {
        if (data) {
            this.status = data.status;
            this.account = data.account;
        } else if (error) {
            console.error('Error:', error);
        }
    }

    get accountUrl() {
        return this.account ? '/' + this.account.Id : null;
    }

    get isConverted() {
        return this.status === 'CONVERTED';
    }
    get isLinked() {
        return this.status === 'LINKED';
    }
    get isNotLinked() {
        return this.status === 'NOT_LINKED';
    }
    get noEmail() {
        return this.status === 'NO_EMAIL';
    }
}