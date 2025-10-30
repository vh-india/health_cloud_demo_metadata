import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class HlsVirtualCareAppointmentCard extends NavigationMixin(LightningElement) {
    @api appointment;

    timeZoneString = '';
    joinCallButtonDisabled = true;
    showGuestWaiting = false;

    connectedCallback(){
        this.timeZoneString = '(' + this.appointment.timeZone + ')';
        if(this.appointment.appointmentStarted){
            this.joinCallButtonDisabled = false;
        }
       
        if(this.appointment.appointmentStarted && !this.appointment.appointmentEnded){
            this.showGuestWaiting = true;
        }
    }

    navigateToRecordPage() {
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.appointment.personAccountId,
                objectApiName: 'Account',
                actionName: 'view'
            }
        }).then(url => { window.open(url) });
    }

    startCall(){
        const startCallEvent = new CustomEvent('startcall', {
            detail: {
                appointment: this.appointment
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(startCallEvent);
    }
}