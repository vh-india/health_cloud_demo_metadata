public with sharing class LeadPersonAccountController {
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> checkLinkedPersonAccount(Id leadId) {
        Map<String, Object> result = new Map<String, Object>();
        Lead leadRecord = [SELECT Id, Email, ConvertedAccountId, IsConverted 
                           FROM Lead WHERE Id = :leadId LIMIT 1];

        // Case 1: Lead is already converted
        if (leadRecord.IsConverted && leadRecord.ConvertedAccountId != null) {
            Account acc = [SELECT Id, Name, PersonEmail FROM Account 
                           WHERE Id = :leadRecord.ConvertedAccountId LIMIT 1];
            result.put('status', 'CONVERTED');
            result.put('account', acc);
            return result;
        }

        // Case 2: Lead not converted, but check if Person Account exists with same email
        if (String.isNotBlank(leadRecord.Email)) {
            List<Account> accList = [SELECT Id, Name, PersonEmail 
                                     FROM Account 
                                     WHERE IsPersonAccount = true 
                                     AND PersonEmail = :leadRecord.Email 
                                     LIMIT 1];
            if (!accList.isEmpty()) {
                result.put('status', 'LINKED');
                result.put('account', accList[0]);
            } else {
                result.put('status', 'NOT_LINKED');
            }
        } else {
            result.put('status', 'NO_EMAIL');
        }
        
        return result;
    }
}