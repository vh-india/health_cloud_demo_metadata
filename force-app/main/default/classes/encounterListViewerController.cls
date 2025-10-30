public with sharing class encounterListViewerController {
    
    @AuraEnabled(cacheable=true)
    public static List<ClinicalEncounter> getEncounters() {
        try {
            if (Schema.sObjectType.ClinicalEncounter.isAccessible()) {
                List<ClinicalEncounter> encounters = [
                    SELECT Id, Name, StartDate, Category, Status, Patient.Name, Doctor__r.Name 
                    FROM ClinicalEncounter 
                    WHERE (Status = 'Planned' OR Status = 'In Progress' OR Status = 'Completed')
                    ORDER BY StartDate ASC
                ];
                return encounters;
            } 
            return new List<ClinicalEncounter>();
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

}