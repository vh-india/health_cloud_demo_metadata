import { LightningElement, api, track } from 'lwc';
import fetchPrescriptionsUnderEncounter from '@salesforce/apex/currentRxViewerController.fetchPrescriptionsUnderEncounter';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CurrentRxViewer extends LightningElement {
    isLoading = false;
    _selectedEncounterId;
    _printMode;
    @track prescriptions = [];
    @track columnsToDisplay;
    get isEncounterSelected() {
        return this._selectedEncounterId && this._selectedEncounterId !== undefined;
    }

    get prescriptionNotAvailable() {
        return !(this.prescriptions.length > 0);
    }

    @api set printMode(value) {
        this._printMode = value;
        if(this._printMode) {
            this.columnsToDisplay = [...this.printColumns];
        } else {
            this.columnsToDisplay = [...this.columns];
        }
    } get printMode() {
        return this._printMode;
    };

    @api set selectedEncounterId(value) {
        this._selectedEncounterId = value;
        this.fetchRxUnderEncounter();
    } get selectedEncounterId() {
        return this._selectedEncounterId;
    };

    @api fetchRxUnderEncounter() {
        if(this.selectedEncounterId != null) {
            this.isLoading = true;
            fetchPrescriptionsUnderEncounter({encounterId: this.selectedEncounterId})
            .then(result => {
                console.log(JSON.stringify(result));
                this.prescriptions = result;
            })
            .catch(error => {
                console.error(error);
            }).finally(() => {
                this.isLoading = false;
            });
        }
    }

    columns = [
        { label: 'Medication Name', fieldName: 'Medication_Name__c' },
        { label: 'Dosage', fieldName: 'Dosage__c' },
        { label: 'Frequency', fieldName: 'Frequency__c' },
        { label: 'Duration (days)', fieldName: 'Duration__c' },
        { type: 'button-icon', 
            typeAttributes: {
                name: 'delete',
                title: 'Delete',
                variant: 'neutral',
                iconName: 'utility:delete'
            }
        }
    ];

    printColumns = [
        { label: 'Medication Name', fieldName: 'Medication_Name__c' },
        { label: 'Dosage', fieldName: 'Dosage__c' },
        { label: 'Frequency', fieldName: 'Frequency__c' },
        { label: 'Duration (days)', fieldName: 'Duration__c' },
    ];

    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;

        if (action.name === 'delete') {
            this.isLoading = true;
            deleteRecord(row.Id)
                .then(() => {
                    this.fetchRxUnderEncounter();
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Record deleted',
                            variant: 'success'
                        })
                    );
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error deleting record',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                }).finally(() => {
                    this.isLoading = false;
                });
        }
    }
}