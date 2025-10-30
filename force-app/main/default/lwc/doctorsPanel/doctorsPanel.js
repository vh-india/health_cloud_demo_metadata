import { LightningElement, wire, track, api } from 'lwc';
import USER_ID from '@salesforce/user/Id';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import NAME_FIELD from '@salesforce/schema/User.Name';
import CE_ADMISSION_RECOMMENDED_FIELD from '@salesforce/schema/ClinicalEncounter.Admission_Recommended__c';

export default class DoctorsPanel extends LightningElement {
    @api setEncounter(encounterId) {
        this.selectedEncounterId = encounterId;
        // const picker = this.template.querySelector('lightning-record-picker');
        // if (picker) {
        //     picker.value = encounterId;
        // }
    }
    
    @track userId = USER_ID;
    @track selectedEncounterId;
    userName;
    printMode = false;
    admmissionRecommended;

    matchingInfo = {
        primaryField: { fieldPath: 'Name' },
        additionalFields: [{ fieldPath: 'Patient.Name' }],
    };

    displayInfo = {
        primaryField: 'Name',
        additionalFields: ['Patient.Name'],
    };

    @wire(getRecord, { recordId: '$selectedEncounterId', fields: [CE_ADMISSION_RECOMMENDED_FIELD] })
    wiredUser({ error, data }) {
        if (data) {
            this.admmissionRecommended = data.fields.Admission_Recommended__c.value;
            console.log('Fetched Admission_Recommended__c data:', this.admmissionRecommended);
        } else if (error) {
            console.error('Error fetching Admission_Recommended__c data', error);
        }
    }

    @wire(getRecord, { recordId: '$userId', fields: [NAME_FIELD] })
    wiredUser({ error, data }) {
        if (data) {
            this.userName = data.fields.Name.value;
        } else if (error) {
            console.error('Error fetching user data', error);
        }
    }

    get isEncounterSelected() {
        return !(this.selectedEncounterId != null && this.selectedEncounterId != undefined && this.selectedEncounterId != '');
    }

    get admissionReasonClass() {
        return this.admmissionRecommended ? '' : 'slds-hide';
    }

    handleEncounterChange(event) {
        this.selectedEncounterId = event.detail.recordId;
    }

    handlePrescriptionAdd(event) {
        this.refs.currentRxViewer.fetchRxUnderEncounter();
    }

    handlePrintToggleChange(event) {
        const isChecked = event.target.checked;
        this.printMode = isChecked;
    }

    handleAdmitCheckboxChange(event) {
        this.admmissionRecommended = event.detail.checked;
    }

    handleSuccess(event) {
        console.log('Record saved successfully:');

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Encounter done successfully!',
                variant: 'success'
            })
        );

        this.selectedEncounterId = null; 
        const picker = this.template.querySelector('lightning-record-picker');
        if (picker) {
            picker.value = null;
        }
    }

    handleSubmit(event) {
        console.log('Submitting form with values:', event.detail.fields);
    }

    handleError(event) {
        console.error('Error AKS while saving record:', JSON.stringify(event.detail));
         console.error('Error AKS while saving record:', event.detail.message);
    }
    
}