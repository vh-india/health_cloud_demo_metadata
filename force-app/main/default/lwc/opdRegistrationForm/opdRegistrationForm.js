import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import PATIENT_OBJECT from '@salesforce/schema/Account';
import PATIENT_FNAME_FIELD from '@salesforce/schema/Account.FirstName';
import PATIENT_LNAME_FIELD from '@salesforce/schema/Account.LastName';
import PATIENT_PHONE_FIELD from '@salesforce/schema/Account.Phone';

import CLINICAL_ENCOUNTER_OBJECT from '@salesforce/schema/ClinicalEncounter';
import PATIENT_FIELD from '@salesforce/schema/ClinicalEncounter.PatientId';
import ENCOUNTER_TYPE_FIELD from '@salesforce/schema/ClinicalEncounter.Encounter_Type__c';
import STATUS_FIELD from '@salesforce/schema/ClinicalEncounter.Status';
import ENCOUNTER_DATE_FIELD from '@salesforce/schema/ClinicalEncounter.StartDate'; // Assuming StartDate is the field for encounter date
import DOCTOR_FIELD from '@salesforce/schema/ClinicalEncounter.Doctor__c';
import SUMMARY_FIELD from '@salesforce/schema/ClinicalEncounter.Summary__c';
import ENCOUNTER_LOCATION_FIELD from '@salesforce/schema/ClinicalEncounter.Category'; // Assuming Category is the field for location

export default class OpdRegistrationForm extends LightningElement {
    fields = {
        patient: PATIENT_FIELD,
        encounterType: ENCOUNTER_TYPE_FIELD,
        status: STATUS_FIELD,
        encounterDate: ENCOUNTER_DATE_FIELD,
        doctor: DOCTOR_FIELD,
        summary: SUMMARY_FIELD,
        encounterLocation: ENCOUNTER_LOCATION_FIELD
    };

    patienFields = {
        fname: PATIENT_FNAME_FIELD,
        lname: PATIENT_LNAME_FIELD,
        phone: PATIENT_PHONE_FIELD
    };

    // recordId;
    objectApiName = CLINICAL_ENCOUNTER_OBJECT;
    patientApiName = PATIENT_OBJECT;

    togglePatientModal = false;

    handleAddPatient() {
        this.togglePatientModal = !this.togglePatientModal;
    }

    handleSuccess(event) {
        window.location.reload();
    }
}