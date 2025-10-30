import { LightningElement } from 'lwc';
import createLead from '@salesforce/apex/CaseController.createLead';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CreateLeadForm extends LightningElement {
    hospitalImage = '/resource/hospitalLogo'; // replace with Static Resource if needed

    // Handle form submit
    async handleSubmit() {
        console.log('[DEBUG] handleSubmit called');

        // Gather input values
        const fields = {
            firstName: this.template.querySelector('#first_name')?.value,
            lastName: this.template.querySelector('#last_name')?.value,
            email: this.template.querySelector('#email')?.value,
            phone: this.template.querySelector('#phone')?.value,
            dob: this.template.querySelector('#dob')?.value,
            gender: this.template.querySelector('#gender')?.value,
            city: this.template.querySelector('#city')?.value,
            state: this.template.querySelector('#state')?.value,
            country: this.template.querySelector('#country')?.value,
            description: this.template.querySelector('#description')?.value
        };

        console.log('[DEBUG] Collected Form Data: ', JSON.stringify(fields));

        try {
            const leadId = await createLead(fields);
            console.log('[DEBUG] Lead created successfully with Id: ', leadId);

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Lead created successfully! Id: ' + leadId,
                    variant: 'success'
                })
            );

            // Reset form
            this.template.querySelectorAll('input, textarea, select').forEach(el => {
                el.value = '';
            });
        } catch (error) {
            console.error('[DEBUG] Error creating Lead: ', error);

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: error.body?.message || 'Unknown error occurred',
                    variant: 'error'
                })
            );
        }
    }
}