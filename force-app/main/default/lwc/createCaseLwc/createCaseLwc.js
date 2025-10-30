import { LightningElement, track } from 'lwc';
import createCase from '@salesforce/apex/CaseController.createCase';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CreateCaseLwc extends LightningElement {
    hospitalImage = 'https://lwfiles.mycourse.app/633fd97f1c71b6a7e18ff2ea-public/dbaf19127fbf97efe62b5f30c37ceb46.jpeg';
    newCaseId;

    @track name = '';
    @track email = '';
    @track phone = '';
    @track subject = '';
    @track description = '';
    @track priority = '';
    @track caseType = '';

    priorityOptions = [
        { label: 'Critical', value: 'Critical' },
        { label: 'High', value: 'High' },
        { label: 'Medium', value: 'Medium' },
        { label: 'Low', value: 'Low' },
        { label: 'Urgent', value: 'Urgent' },
        { label: 'Routine', value: 'Routine' },
        { label: 'Deferred', value: 'Deferred' },
        { label: 'Normal', value: 'Normal' },
        { label: 'Stat', value: 'Stat' }
    ];

    caseTypeOptions = [
        { label: 'Inquiry', value: 'Inquiry' },
        { label: 'Compliant', value: 'Compliant' },
        { label: 'Feedback', value: 'Feedback' }
    ];

    handleChange(event) {
        const { name, value } = event.target;
        this[name] = value;
        console.log(`Field changed: ${name} → ${value}`);
    }

    handleSubmit() {
        console.log('📌 Submitting case with data:', {
            name: this.name,
            email: this.email,
            phone: this.phone,
            subject: this.subject,
            description: this.description,
            priority: this.priority,
            caseType: this.caseType
        });

        // Basic validation before calling Apex
        if (!this.name || !this.email || !this.phone || !this.subject || !this.description) {
            console.warn('⚠ Missing required fields!');
            this.dispatchEvent(new ShowToastEvent({
                title: 'Missing Fields',
                message: 'Please fill all required fields before submitting.',
                variant: 'warning'
            }));
            return;
        }

        createCase({
            name: this.name,
            email: this.email,
            phone: this.phone,
            subject: this.subject,
            description: this.description,
            priority: this.priority,
            caseType: this.caseType
        })
        .then(caseId => {
            console.log('✅ Case created successfully, ID:', caseId);
            this.newCaseId = caseId;
            this.dispatchEvent(new ShowToastEvent({
                title: 'Case Created',
                message: 'Case ID: ' + caseId,
                variant: 'success'
            }));
        })
        .catch(error => {
            console.error('❌ Error creating case:', error);
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: error.body ? error.body.message : error.message,
                variant: 'error'
            }));
        });
    }

    // handleUploadFinished(event) {
    //     const uploadedFiles = event.detail.files;
    //     console.log(`📂 Files uploaded: ${JSON.stringify(uploadedFiles)}`);
    //     this.dispatchEvent(new ShowToastEvent({
    //         title: 'Files Uploaded',
    //         message: `${uploadedFiles.length} file(s) uploaded successfully.`,
    //         variant: 'success'
    //     }));
    // }
}