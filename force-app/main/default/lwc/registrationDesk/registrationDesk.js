import { LightningElement, track } from 'lwc';

export default class RegistrationDesk extends LightningElement {
    accountFields = ['Name', 'PersonGender', 'PersonEmail', 'PersonMobilePhone', 'Notes__c'];
    isSelected = false;
    isNewPatient = false;
    newAccountId = null;
    @track inputEncounterFlowVariables = [
      {
        name: "PatientIdForInput",
        type: "String",
        value: ''
      }
    ];

    handleNewPatient() {
        this.isSelected = true;
        this.isNewPatient = true;
        this.dispatchEvent(new CustomEvent('select', { detail: 'new' }));
    }

    handleExistingPatient() {
        this.isSelected = true;
        this.isNewPatient = false;
        this.dispatchEvent(new CustomEvent('select', { detail: 'existing' }));
    }

    handleNewAccountSuccess(event) {
        this.inputEncounterFlowVariables[0].value = event.detail.id;
        this.isNewPatient = false;
    }

    handleCancel() {
        this.isSelected = false;
        this.isNewPatient = false;
        this.newAccountId = null;
        this.inputEncounterFlowVariables[0].value = '';
    }

    handleStatusChange(event) {
        if (event.detail.status === "FINISHED" || event.detail.status === "ERROR" || event.detail.status === "PAUSED") {
            this.handleCancel();
        }
    }
}