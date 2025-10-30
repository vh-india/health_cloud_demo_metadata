public with sharing class patientHistoricEncounterViewerController {
    
    @AuraEnabled(cacheable=true)
    public static PatientEncounterWrapper fetchPatientRelatedEncounters(Id selectedEncounterId) {
        try{
            ClinicalEncounter selectedEncounter = [
                SELECT Id, PatientId, Patient.Name
                FROM ClinicalEncounter
                WHERE Id = :selectedEncounterId
                LIMIT 1
            ];

            if (selectedEncounter == null || selectedEncounter.PatientId == null) {
                return null;
            }

            Id patientId = selectedEncounter.PatientId;
            String patientName = selectedEncounter.Patient.Name;

            List<ClinicalEncounter> encounters = [
                SELECT Name, Status , Doctor__r.Name , Summary__c , Category , StartDate,
                    (SELECT Medication_Name__c , Dosage__c , Duration__c , Frequency__c
                    FROM Prescription__r)
                FROM ClinicalEncounter
                WHERE PatientId = :patientId
                ORDER BY StartDate DESC
            ];

            return new PatientEncounterWrapper(patientId, patientName, encounters);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public class PatientEncounterWrapper {
        @AuraEnabled public Id patientId;
        @AuraEnabled public String patientName;
        @AuraEnabled public List<ClinicalEncounter> encounters;

        public PatientEncounterWrapper(Id patientId, String patientName, List<ClinicalEncounter> encounters) {
            this.patientId = patientId;
            this.patientName = patientName;
            this.encounters = encounters;
        }
    }
}