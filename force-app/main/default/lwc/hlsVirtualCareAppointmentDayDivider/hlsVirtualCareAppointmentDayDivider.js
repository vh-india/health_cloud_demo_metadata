import TickerSymbol from '@salesforce/schema/Account.TickerSymbol';
import { LightningElement, api } from 'lwc';

export default class HlsVirtualCareAppointmentDayDivider extends LightningElement {
    @api firstDay = false;
    @api appointmentsToday = false;
    @api dateText;
    @api numberOfAppointments;

    @api
    get triggerRefreshAppointments() {
        return this._triggerRefreshAppointments;
    }

    set triggerRefreshAppointments(value) {
        this._triggerRefreshAppointments = value;
        if(value){
            this.refreshAppointments();
        }
    }

    fullDateText;
    numberOfAppointmentsText; 

    connectedCallback(){
        if(this.appointmentsToday){
            this.fullDateText = 'Today, ' + this.dateText;
        } else{
            this.fullDateText = this.dateText;
        }

        if(this.numberOfAppointments === 1){
            this.numberOfAppointmentsText = '1 Appointment';
        } else{
            this.numberOfAppointmentsText = this.numberOfAppointments + ' Appointments';
        }
    }

    refreshAppointments(){
        console.log('refreshAppointments');
        const refreshEvent = new CustomEvent('refreshappointments', {
            detail: {},
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(refreshEvent);
        this._triggerRefreshAppointments = false;
    }
}