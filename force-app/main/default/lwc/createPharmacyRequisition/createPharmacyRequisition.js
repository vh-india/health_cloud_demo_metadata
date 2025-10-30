import { LightningElement, api, track } from 'lwc';
import { updateRecord, deleteRecord } from 'lightning/uiRecordApi';
import getPharmacyRecords from '@salesforce/apex/createPharmacyRequisition.getPharmacyRecords';
import createNewPharmacyRequisition from '@salesforce/apex/createPharmacyRequisition.createNewPharmacyRequisition';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const COLUMNS = [
    { label: 'Medicine Name', fieldName: 'Medicine_Name__c', type: 'text', editable: true },
    // { label: 'Clinical Encounter', fieldName: 'Clinical_Encounter__c', type: 'text' },
    { label: 'Quantity', fieldName: 'Quantity__c', type: 'number', editable: true },
    {
        label: 'Status',
        fieldName: 'Status__c',
        type: 'picklist',
        editable: true,
        typeAttributes: {
            placeholder: 'Choose status',
            options: [
                { label: 'Requested', value: 'Requested' },
                { label: 'Approved', value: 'Approved' },
                { label: 'Dispensed', value: 'Dispensed' }
            ],
            value: { fieldName: 'Status__c' }, 
            context: { fieldName: 'Id' }
        }
    },
    {
        type: 'button-icon',
        typeAttributes: {
            name: 'delete',
            title: 'Delete',
            variant: 'neutral',
            iconName: 'utility:delete'
        }
    }
];

export default class PharmacyRequisition extends LightningElement {
    @api surgeryId;   
    @track records = [];
    @track columns = COLUMNS;
    @track draftValues = [];
    error;
    isLoading = false;

    connectedCallback() {
        this.loadRecords();
    }

    loadRecords() {
        this.isLoading = true;
        getPharmacyRecords({ surgeryId: this.surgeryId })
            .then(result => {
                this.records = result;
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                this.records = [];
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    handleSurgeryChange(event) {
        this.surgeryId = event.detail.recordId;
        this.loadRecords();
    }

    handleCreateRequisition() {
        createNewPharmacyRequisition({ surgeryId: this.surgeryId })
        .then(() => {
            this.showToast('Success', 'New requisition created', 'success');
            this.loadRecords();
        })
        .catch(error => {
            this.error = error;
        });
    }

    async handleSave(event) {
        this.isLoading = true;
        const records = event.detail.draftValues.map(draft => {
            return { fields: { ...draft } };
        });

        try {
            const recordUpdatePromises = records.map(recordInput => updateRecord(recordInput));
            await Promise.all(recordUpdatePromises);

            this.showToast('Success', 'Records updated successfully', 'success');
            this.loadRecords();
            this.draftValues = [];
        } catch (error) {
            this.error = error;
            this.showToast('Error updating records', error.body.message, 'error');
        } finally {
            this.isLoading = false;
        }
    }

    handleRowAction(event) {
        const action = event.detail.action.name;
        const row = event.detail.row;

        if (action === 'delete') {
            this.handleDelete(row);
        }
    }

    handleDelete(row) {
        this.isLoading = true;
        deleteRecord(row.Id)
            .then(() => {
                this.showToast('Deleted', 'Record deleted successfully', 'success');
                this.loadRecords();
            })
            .catch(error => {
                this.error = error;
                this.showToast('Error deleting record', error.body.message, 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}