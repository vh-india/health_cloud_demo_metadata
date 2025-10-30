import { LightningElement, api } from 'lwc';

export default class HlsVirtualCareAppointmentReminder extends LightningElement {
    @api appointment;

    message = '';

    connectedCallback(){
        let isWas = 'is';
        if(this.appointment.appointmentStarted){
            isWas = 'was';
        }
        this.message = 'Video call with ' + this.appointment.meetingWithName + ' ' + isWas + ' scheduled to start at ' + this.appointment.formattedStartTime + '.';
    }

    clearNotification(){
        const clearNotificationEvent = new CustomEvent('clearnotification', {
            detail: {},
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(clearNotificationEvent);
    }
}