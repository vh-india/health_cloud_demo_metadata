import { LightningElement, wire, track } from 'lwc';
import getWardWisePatients from '@salesforce/apex/doctorPanelIPDController.getWardWisePatients';
import getLatestEncounter from '@salesforce/apex/doctorPanelIPDController.getLatestEncounter';
import IpdPatientModal from 'c/ipdPatientModal';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class DoctorsPanelIPD extends LightningElement {
    @track wardData = [];

    @wire(getWardWisePatients)
    wiredPatients({ error, data }) {
        if (data) {
            this.wardData = data.map(ward => {
                return {
                    ...ward,
                    patients: ward.patients.map(p => ({
                        patientId: p.patientId,
                        patientName: p.patientName,
                        bedName: p.bedName
                    }))
                };
            });
            console.log('Ward Data =>', JSON.stringify(this.wardData));
        } else if (error) {
            console.error('Error fetching ward data', error);
        }
    }

    handleViewDetails(event) {
    // Step 1: get patientId from the clicked button
    const patientId = event.target.dataset.id;
    console.log('View Details clicked for:', patientId);

    if (!patientId) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: 'Patient Id not found.',
                variant: 'error'
            })
        );
        return;
    }

    // Step 2: fetch latest encounter imperatively
    getLatestEncounter({ patientId: patientId })
        .then(result => {
            // Step 3: handle case when no encounter exists
            if (!result) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'No Encounter Found',
                        message: 'This patient has no clinical encounters yet.',
                        variant: 'info'
                    })
                );
                return;
            }

            const encounterId = result.Id;
            console.log('Latest Encounter Id:', encounterId);

            // Step 4: open modal with the encounterId
            IpdPatientModal.open({
                size: 'large',
                description: 'Doctors Panel modal',
                encounterId: encounterId
            });
        })
        .catch(error => {
            console.error('Error fetching latest encounter:', error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error fetching encounter',
                    message: error.body ? error.body.message : error.message,
                    variant: 'error'
                })
            );
        });
    }
}