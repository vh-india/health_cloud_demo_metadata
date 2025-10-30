public with sharing class createPharmacyRequisition {

    @AuraEnabled
    public static List<Pharmacy_Requisition__c> getPharmacyRecords(String surgeryId) {
        try {
            return [SELECT Id, Name, Medicine_Name__c, Quantity__c, Status__c FROM Pharmacy_Requisition__c WHERE Surgery_Linked__c = :surgeryId];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Pharmacy_Requisition__c createNewPharmacyRequisition(String surgeryId) {
        try {
            if(!String.isBlank(surgeryId)) {
                Pharmacy_Requisition__c pharmacyRecord = new Pharmacy_Requisition__c(
                    Name = 'New Requisition',
                    Surgery_Linked__c = surgeryId,
                    Status__c = 'Requested'
                );
                insert pharmacyRecord;
                return pharmacyRecord; // return the new record
            } 
            return null;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

}