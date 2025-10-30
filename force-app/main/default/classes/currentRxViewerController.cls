public with sharing class currentRxViewerController {
    @AuraEnabled
    public static List<Prescription__c> fetchPrescriptionsUnderEncounter(Id encounterId){
        try {
            List<Prescription__c> prescriptions = [
                SELECT Id, Name, Medication_Name__c, Frequency__c, Dosage__c, Duration__c 
                FROM Prescription__c
                WHERE Clinical_Encounter__c = :encounterId
                ORDER BY CreatedDate DESC
            ];

            if(prescriptions.isEmpty()) {
                 return new List<Prescription__c> ();
            } else {
                return prescriptions;
            }

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}