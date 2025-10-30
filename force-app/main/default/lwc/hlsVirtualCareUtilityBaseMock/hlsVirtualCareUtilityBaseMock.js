import { LightningElement, api, wire } from 'lwc';
import getAppointments from '@salesforce/apex/HLSVirtualCareController.getAppointments';
import { sortData } from 'c/xdoSortUtil';

export default class HlsVirtualCareUtilityBaseMock extends LightningElement {
    @api 
    get notificationCleared() {
        return this._notificationCleared;
    }

    set notificationCleared(value) {
       this._notificationCleared = value;
    }
    _notificationCleared = false;

    @api triggerRefreshAppointments;

    upcomingAppointmentsByDay = [];
    pastAppointmentsByDay = [];
    nextAppointmentToday;
    showNotification = false;
    showAppointments = false;

    connectedCallback(){
        this.retrieveAppointments();
    }

    retrieveAppointments() {
        getAppointments()
            .then(result => {
                if(result){
                    // console.log('getAppointments');
                    let appointments = [...result];
                    // console.log('appointments', JSON.stringify(appointments));
                    let futureAppointments = [];
                    let pastAppointments = [];
                    for(let i = 0; i < appointments.length; i++){
                        let appointment = appointments[i];
                        if(appointment.appointmentEnded){
                            pastAppointments.push(appointment);
                        } else{
                            futureAppointments.push(appointment);
                        }
                    }

                    pastAppointments = [...this.sortAppointments(pastAppointments, 'DESC')];

                    this.pastAppointmentsByDay = this.createAppointmentLists(pastAppointments, this.pastAppointmentsByDay);
                    this.upcomingAppointmentsByDay = this.createAppointmentLists(futureAppointments, this.upcomingAppointmentsByDay);
                    this.sendNotificationShownEvent();

                    if(!this.nextAppointmentToday || this.notificationCleared){
                        this.showAppointments = true;
                    }
                }
            })
            .catch(error => {
                console.log('getAppointments error', error);
            });
    }

    createAppointmentLists(appointments, appointmentsByDayOne){
        for(let i = 0; i < appointments.length; i++){
            let appointment = appointments[i];
            if(!this.nextAppointmentToday && appointment.appointmentToday === true && !appointment.appointmentEnded){
                this.nextAppointmentToday = appointment;
                if(!this.notificationCleared){
                    this.showNotification = true;
                }
            }

            if(appointmentsByDayOne && appointmentsByDayOne.length > 0){
                let dayAlreadyInserted = false;
                for(let a = 0; a < appointmentsByDayOne.length; a++){
                    let appointmentListObj = appointmentsByDayOne[a];
                    if(appointmentListObj.formattedDate === appointment.formattedDate){
                        dayAlreadyInserted = true;
                        break;
                    }
                }
                if(dayAlreadyInserted){
                    for(let a = 0; a < appointmentsByDayOne.length; a++){
                        let appointmentListObj = Object.assign({}, appointmentsByDayOne[a]);
                        if(appointmentListObj.formattedDate === appointment.formattedDate){
                            appointmentListObj.appointments.push(appointment);
                            appointmentsByDayOne.splice(a, appointmentListObj);
                            break;
                        }
                    }
                } else{
                    let oneDaysAppointments = {};
                    oneDaysAppointments.firstDay = false;
                    oneDaysAppointments.appointmentsToday = appointment.appointmentToday;
                    oneDaysAppointments.formattedDate = appointment.formattedDate;
                    oneDaysAppointments.appointments = [];
                    oneDaysAppointments.appointments.push(appointment);
                    appointmentsByDayOne.push(oneDaysAppointments);
                }
            } else{
                appointmentsByDayOne = [];
                let oneDaysAppointments = {};
                oneDaysAppointments.firstDay = true;
                oneDaysAppointments.appointmentsToday = appointment.appointmentToday;
                oneDaysAppointments.formattedDate = appointment.formattedDate;
                oneDaysAppointments.appointments = [];
                oneDaysAppointments.appointments.push(appointment);
                appointmentsByDayOne.push(oneDaysAppointments);
            }
        }

        let appointmentsByDay = [];
        for(let a = 0; a < appointmentsByDayOne.length; a++){
            let appointmentListObj = Object.assign({}, appointmentsByDayOne[a]);
            appointmentListObj.numberOfAppointments = appointmentListObj.appointments.length;
            appointmentsByDay.push(appointmentListObj);
        }
        
        return appointmentsByDay;
    }

    clearNotification(event){
        event.stopPropagation();
        this.showNotification = false;
        this._notificationCleared = true;
        this.showAppointments = true;
        this.sendNotificationShownEvent();
    }

    refreshAppointments(event){
        event.stopPropagation();
        this.upcomingAppointmentsByDay = [];
        this.pastAppointmentsByDay = [];
        this.retrieveAppointments();
    }

    sortAppointments(appointments, sortDirection){
        let appointmentsTwo = [];
        appointments.forEach(appointment => {
            let appointmentObj = Object.assign({}, appointment);
            appointmentObj.startDT = new Date(appointment.startDateTime);
            appointmentsTwo.push(appointmentObj);
        });
        return sortData(appointmentsTwo, sortDirection, 'startDT');
    }

    sendNotificationShownEvent(){
        const notificationShownEvent = new CustomEvent('notificationshown', {
            detail: {
                notificationShown: this.showNotification
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(notificationShownEvent);
    }
}