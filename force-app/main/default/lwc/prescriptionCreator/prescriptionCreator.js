import { LightningElement, wire, api } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import No_ENCOUNTER_SELECTED_IMG from '@salesforce/resourceUrl/NO_ENCOUNTER';
import ENCOUNTER_NAME_FIELD from '@salesforce/schema/ClinicalEncounter.Name';

export default class PrescriptionCreator extends LightningElement {
    noEncounterImgUrl = No_ENCOUNTER_SELECTED_IMG;
    
    _selectedEncounterId;
    RxClinicalEncounter;
    RxPrecriptionBy;
    RxIssuedDate;
    @api doctorId;
    @api
    set selectedEncounterId(value) {
        this._selectedEncounterId = value;
    }
    get selectedEncounterId() {
        return this._selectedEncounterId;
    }

    get isEncounterSelected() {
        return (this.selectedEncounterId && this.selectedEncounterId !== undefined);
    }

    @wire(getRecord, { recordId: '$_selectedEncounterId', fields: [ENCOUNTER_NAME_FIELD] })
    wiredUser({ error, data }) {
        if (data && this._selectedEncounterId && this._selectedEncounterId !== 'undefined') {
            this.RxClinicalEncounter = this._selectedEncounterId;
            this.RxPrecriptionBy = this.doctorId;

            const today = new Date();
            const pad = (n) => n.toString().padStart(2, '0');
            const formattedDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
            this.RxIssuedDate = formattedDate;

        } else if (error) {
            console.error('Error fetching user data', error);
            this.handleError(error);
        }
    }

    handleSuccess(event) {
        console.log('RX created>',JSON.stringify(event.detail));
        this.dispatchEvent(new ShowToastEvent({
            title: 'Precription Added',
            message: event.detail.fields.Medication_Name__c.value + ' was added to ' + event.detail.fields.Clinical_Encounter__r.displayValue,
            variant: 'success'
        }));

        this.dispatchEvent(
            new CustomEvent('prescriptionadd', {
                detail: {
                    prescriptionid: event.detail.id
                }
            })
        );

        // Resetting the form
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        if (inputFields) {
            inputFields.forEach(field => {
                const fieldName = field.fieldName;
                if (fieldName !== 'Clinical_Encounter__c' && fieldName !== 'Prescribed_By__c' && fieldName !== 'Date_Issued__c') {
                    field.reset();
                }
            });
        }
    }

    handleError(event) {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Error',
            message: event.detail.message,
            variant: 'error'
        }));
    }
}