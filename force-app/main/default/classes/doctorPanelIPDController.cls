public with sharing class doctorPanelIPDController {

    @AuraEnabled
    public static ClinicalEncounter getLatestEncounter(Id patientId) {
        if (patientId == null) {
            return null;
        }

        // Query the latest ClinicalEncounter for the patient
        ClinicalEncounter latestEncounter = [
            SELECT Id, Name, CreatedDate, Admission_Recommended__c
            FROM ClinicalEncounter
            WHERE PatientId = :patientId AND Category = 'Inpatient Encounter'
            ORDER BY CreatedDate DESC
            LIMIT 1
        ];

        return latestEncounter;
    }
    
    @AuraEnabled(cacheable = true)
    public static List<WardWrapper> getWardWisePatients(){
        try {
            Date nowDate = Date.today();

            List<Inpatient_Admission__c> admissions = [
                SELECT Id, Patient__c, Patient__r.Name, Bed_Inventory__r.Name, Bed_Inventory__r.Ward__r.Name
                FROM Inpatient_Admission__c
                // WHERE Admission_Date__c <= :nowDate
                //   AND Discharge_Date__c >= :nowDate
                ORDER BY Bed_Inventory__r.Ward__r.Name, Bed_Inventory__r.Name
            ];

            Map<String, WardWrapper> wardMap = new Map<String, WardWrapper>();

            for (Inpatient_Admission__c adm : admissions) {
                String ward = adm.Bed_Inventory__r.Ward__r.Name;
                if (String.isBlank(ward)) ward = 'Unassigned';

                if (!wardMap.containsKey(ward)) {
                    wardMap.put(ward, new WardWrapper(ward));
                }

                wardMap.get(ward).patients.add(
                    new PatientWrapper(adm.Patient__c, adm.Patient__r.Name, adm.Bed_Inventory__r.Name)
                );
            }

            return wardMap.values();

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    // Ward wrapper
    public class WardWrapper {
        @AuraEnabled public String wardName {get; set;}
        @AuraEnabled public List<PatientWrapper> patients {get; set;}
        @AuraEnabled public Integer count {get { return patients != null ? patients.size() : 0; }}
        
        public WardWrapper(String wardName) {
            this.wardName = wardName;
            this.patients = new List<PatientWrapper>();
        }
    }

    // Patient wrapper
    public class PatientWrapper {
        @AuraEnabled public Id patientId {get; set;}
        @AuraEnabled public String patientName {get; set;}
        @AuraEnabled public String bedName {get; set;}
        
        public PatientWrapper(Id id, String name, String bedName) {
            this.patientId = id;
            this.patientName = name;
            this.bedName = bedName;
        }
    }
}