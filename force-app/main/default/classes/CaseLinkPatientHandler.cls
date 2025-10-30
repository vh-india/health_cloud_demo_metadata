public with sharing class CaseLinkPatientHandler {

    public static void linkPatientsToCases(List<Case> newCases) {
        Set<String> emails = new Set<String>();
        Set<String> names = new Set<String>();

        for (Case c : newCases) {
            if (String.isNotBlank(c.SuppliedEmail)) {
                emails.add(c.SuppliedEmail.trim());
            }
            if (String.isNotBlank(c.SuppliedName)) {
                names.add(c.SuppliedName.trim());
            }
        }

        System.debug('⚙️ Collected Emails: ' + emails);
        System.debug('⚙️ Collected Names: ' + names);

        if (emails.isEmpty() && names.isEmpty()) {
            System.debug('❌ No Email or Name provided — skipping match.');
            return;
        }

        // Query conditionally depending on what we have
        List<Account> matchingAccounts;
        if (!emails.isEmpty() && !names.isEmpty()) {
            matchingAccounts = [
                SELECT Id, Name, PersonEmail, PersonHomePhone,
                       PersonMailingStreet, PersonMailingCity, PersonMailingState, PersonMailingPostalCode
                FROM Account
                WHERE IsPersonAccount = true
                AND (PersonEmail IN :emails OR Name IN :names)
            ];
        } else if (!emails.isEmpty()) {
            matchingAccounts = [
                SELECT Id, Name, PersonEmail, PersonHomePhone,
                       PersonMailingStreet, PersonMailingCity, PersonMailingState, PersonMailingPostalCode
                FROM Account
                WHERE IsPersonAccount = true
                AND PersonEmail IN :emails
            ];
        } else {
            matchingAccounts = [
                SELECT Id, Name, PersonEmail, PersonHomePhone,
                       PersonMailingStreet, PersonMailingCity, PersonMailingState, PersonMailingPostalCode
                FROM Account
                WHERE IsPersonAccount = true
                AND Name IN :names
            ];
        }

        System.debug('🔍 Matching Accounts: ' + matchingAccounts);

        // Build lookup maps for easy match
        Map<String, Id> emailToAccount = new Map<String, Id>();
        Map<String, Id> nameToAccount = new Map<String, Id>();

        for (Account acc : matchingAccounts) {
            if (String.isNotBlank(acc.PersonEmail)) {
                emailToAccount.put(acc.PersonEmail.trim().toLowerCase(), acc.Id);
            }
            if (String.isNotBlank(acc.Name)) {
                nameToAccount.put(acc.Name.trim().toLowerCase(), acc.Id);
            }
        }

        List<Case> casesToUpdate = new List<Case>();

        for (Case c : newCases) {
            if (c.AccountId == null) {
                Id matchedAccId;

                if (String.isNotBlank(c.SuppliedEmail) &&
                    emailToAccount.containsKey(c.SuppliedEmail.trim().toLowerCase())) {
                    matchedAccId = emailToAccount.get(c.SuppliedEmail.trim().toLowerCase());
                    System.debug('✅ Matched by Email: ' + c.SuppliedEmail + ' → ' + matchedAccId);
                }
                else if (String.isNotBlank(c.SuppliedName) &&
                         nameToAccount.containsKey(c.SuppliedName.trim().toLowerCase())) {
                    matchedAccId = nameToAccount.get(c.SuppliedName.trim().toLowerCase());
                    System.debug('✅ Matched by Name: ' + c.SuppliedName + ' → ' + matchedAccId);
                }

                if (matchedAccId != null) {
                    casesToUpdate.add(new Case(Id = c.Id, AccountId = matchedAccId));
                }
                else {
                    System.debug('⚠️ No match found for Case: ' + c.Id);
                }
            }
        }

        if (!casesToUpdate.isEmpty()) {
            update casesToUpdate;
            System.debug('💾 Updated ' + casesToUpdate.size() + ' cases with matched Account IDs.');
        } else {
            System.debug('ℹ️ No cases needed updating.');
        }
    }
}