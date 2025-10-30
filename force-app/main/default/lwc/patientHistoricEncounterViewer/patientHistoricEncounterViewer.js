import { LightningElement, api, track } from 'lwc';
import NO_PATIENT_HISTORY from '@salesforce/resourceUrl/NO_PATIENT_HISTORY';
import fetchPatientRelatedEncounters from '@salesforce/apex/patientHistoricEncounterViewerController.fetchPatientRelatedEncounters';

export default class PatientHistoricEncounterViewer extends LightningElement {
    noEncounterImgUrl = NO_PATIENT_HISTORY;
    patientName;
    @track resultToDisplay;
    _selectedEncounterId;
    @api set selectedEncounterId(value) {
        this._selectedEncounterId = value;
        if(this._selectedEncounterId && this._selectedEncounterId !== undefined) {
           fetchPatientRelatedEncounters({ selectedEncounterId: this._selectedEncounterId })
            .then(result => {
                this.resultToDisplay = result;
                this.patientName = this.resultToDisplay.patientName;
                this.encounters = this.resultToDisplay.encounters.map(enc => {
                    const dateOnly = new Date(enc.StartDate).toISOString().split('T')[0];
                    return {
                        ...enc,
                        label: `CE-0019 | ${dateOnly}`
                    };
                });
            })
            .catch(error => {
                console.error(error);
            });
        }
    } get selectedEncounterId() {
        return this._selectedEncounterId;
    }

    get isEncounterSelected() {
        return this.selectedEncounterId && this.selectedEncounterId !== undefined;
    }
}