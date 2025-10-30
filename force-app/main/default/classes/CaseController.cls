public with sharing class CaseController {
    @AuraEnabled
    public static Id createCase(
        String name, 
        String email, 
        String phone, 
        String subject, 
        String description, 
        String priority, 
        String caseType
    ) {
        Case newCase = new Case(
            Subject     = subject,
            Description = description,
            Priority    = String.isBlank(priority) ? null : priority,
            Origin      = 'Web',
            RecordTypeId= getHelpdeskCaseRecordTypeId(),
            Status      = 'New',
                SuppliedEmail = email,
    SuppliedName  = name

        );

        if (!String.isBlank(caseType)) {
            newCase.put('Case_Type__c', caseType);
        }

        insert newCase;
        return newCase.Id;
    }

    private static Id getHelpdeskCaseRecordTypeId() {
        List<RecordType> rts = [
            SELECT Id 
            FROM RecordType 
            WHERE SObjectType = 'Case' 
            AND DeveloperName = 'SDO_Service_Case'
            LIMIT 1
        ];
        return !rts.isEmpty() ? rts[0].Id : null;
    }

 @AuraEnabled
    public static Id createLead(String firstName, String lastName, String email, String phone, 
                                Date dob, String gender, String city, String state, String country, 
                                String description) {
        System.debug('>>> [DEBUG] Entered createLead method');
        System.debug('>>> [DEBUG] Params: ' + JSON.serializePretty(
            new Map<String, Object>{
                'firstName' => firstName,
                'lastName' => lastName,
                'email' => email,
                'phone' => phone,
                'dob' => dob,
                'gender' => gender,
                'city' => city,
                'state' => state,
                'country' => country,
                'description' => description
            }
        ));

        if (String.isBlank(firstName) || String.isBlank(lastName) || String.isBlank(email)) {
            throw new AuraHandledException('First Name, Last Name, and Email are required.');
        }

        Lead newLead = new Lead(
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Phone = phone,
            Company = 'Trinity Hope Hospital', // required field for Lead
            Description = description,
            City = city,
            State = state,
            Country = country,
            Status = 'Open - Not Contacted'
        );

        insert newLead;
        System.debug('>>> [DEBUG] Lead Created with Id: ' + newLead.Id);

        return newLead.Id;
    }



}