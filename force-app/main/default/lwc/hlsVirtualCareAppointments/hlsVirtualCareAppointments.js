import { LightningElement, api } from 'lwc';

export default class HlsVirtualCareAppointments extends LightningElement {
    @api
    get upcomingAppointmentsByDay() {
        return this._upcomingAppointmentsByDay;
    }
    set upcomingAppointmentsByDay(value) {
        this._upcomingAppointmentsByDay = value;
        if(!this._upcomingAppointmentsByDay || this._upcomingAppointmentsByDay.length == 0){
            this.showNoUpcomingAppointmentsMessage = true;
        } else{
            this.showNoUpcomingAppointmentsMessage = false;
        }
    }
    _upcomingAppointmentsByDay;

    @api
    get pastAppointmentsByDay() {
        return this._pastAppointmentsByDay;
    }
    set pastAppointmentsByDay(value) {
        this._pastAppointmentsByDay = value;
        if(!this._pastAppointmentsByDay || this._pastAppointmentsByDay.length == 0){
            this.showNoPastAppointmentsMessage = true;
        } else{
            this.showNoPastAppointmentsMessage = false;
        }
    }
    _pastAppointmentsByDay;

    @api triggerRefreshAppointments;

    showNoUpcomingAppointmentsMessage = false;
    showNoPastAppointmentsMessage = false;

    connectedCallback(){
        console.log('inside appointment list');
    }
}