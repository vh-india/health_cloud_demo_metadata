import LightningModal from 'lightning/modal';
import { api } from 'lwc';

export default class IpdPatientModal extends LightningModal {
    @api encounterId; 
    _encounterSet = false; 

    renderedCallback() {
        // Only try to set encounter once
        if (this.encounterId && !this._encounterSet) {
            const panel = this.template.querySelector('c-doctors-panel');
            if (panel) {
                panel.setEncounter(this.encounterId);
                this._encounterSet = true;
            }
        }
    }
}