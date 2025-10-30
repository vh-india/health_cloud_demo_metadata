public class PatientLeadHandler {
public static void processLeads(List<Lead> leads) {
    // ✅ Prepare duplicate rule bypass options
    Database.DMLOptions dmlOpts = new Database.DMLOptions();
    dmlOpts.DuplicateRuleHeader.allowSave = true;         // Ignore duplicate rules
    dmlOpts.DuplicateRuleHeader.runAsCurrentUser = false; // Run as system context

    // Store existing records
    Map<String, Contact> emailToContactMap = new Map<String, Contact>();
    Map<String, Account> emailToAccountMap = new Map<String, Account>();

    // 1️⃣ Gather all unique lead emails
    Set<String> leadEmails = new Set<String>();
    for (Lead l : leads) {
        if (String.isNotBlank(l.Email)) {
            leadEmails.add(l.Email.trim().toLowerCase());
        }
    }

    // 2️⃣ Check existing Contacts
    if (!leadEmails.isEmpty()) {
        for (Contact c : [
            SELECT Id, Email, AccountId
            FROM Contact
            WHERE Email IN :leadEmails
        ]) {
            if (String.isNotBlank(c.Email)) {
                emailToContactMap.put(c.Email.toLowerCase(), c);
            }
        }
    }

    // 3️⃣ Check existing Accounts via related Contacts
    if (!leadEmails.isEmpty()) {
        for (Account acc : [
            SELECT Id, Name
            FROM Account
            WHERE Id IN (
                SELECT AccountId FROM Contact WHERE Email IN :leadEmails
            )
        ]) {
            if (String.isNotBlank(acc.Name)) {
                emailToAccountMap.put(acc.Name.toLowerCase(), acc);
            }
        }
    }

    // 4️⃣ Prepare lists for inserts
    List<Account> patientsToInsert = new List<Account>();
    List<Contact> contactsToInsert = new List<Contact>();

    for (Lead l : leads) {
        String emailKey = String.isNotBlank(l.Email) ? l.Email.toLowerCase() : '';
        String accountNameKey = (l.FirstName + ' ' + l.LastName).trim().toLowerCase();

        // Only create if there's no contact AND no patient account
        if (!emailToContactMap.containsKey(emailKey) && !emailToAccountMap.containsKey(accountNameKey)) {
            Account patient = new Account(
                Name = l.FirstName + ' ' + l.LastName,
                Type = 'Patient',
                PersonBirthdate = l.HealthCloudGA__BirthDate__c
            );
            patient.setOptions(dmlOpts); // Bypass duplicate rules
            patientsToInsert.add(patient);

            Contact con = new Contact(
                FirstName = l.FirstName,
                LastName = l.LastName,
                Email = l.Email,
                Phone = l.Phone,
                HealthCloudGA__Gender__c = l.HealthCloudGA__Gender__c
            );
            con.setOptions(dmlOpts); // Bypass duplicate rules
            contactsToInsert.add(con);
        }
    }

    // 5️⃣ Insert Accounts (bypassing duplicate rules)
    if (!patientsToInsert.isEmpty()) {
        Database.insert(patientsToInsert, false);
    }

    // 6️⃣ Link and insert Contacts (bypassing duplicate rules)
    if (!contactsToInsert.isEmpty()) {
        for (Integer i = 0; i < contactsToInsert.size(); i++) {
            contactsToInsert[i].AccountId = patientsToInsert[i].Id;
            if (String.isNotBlank(contactsToInsert[i].Email)) {
                emailToContactMap.put(contactsToInsert[i].Email.toLowerCase(), contactsToInsert[i]);
            }
        }
        Database.insert(contactsToInsert, false);
    }

    // 7️⃣ Create Cases for all patients (new or existing)
    List<Case> casesToInsert = new List<Case>();
    for (Lead l : leads) {
        String emailKey = String.isNotBlank(l.Email) ? l.Email.toLowerCase() : '';
        Contact con = emailToContactMap.get(emailKey);

        if (con != null) {
            casesToInsert.add(new Case(
                Subject = 'Appointment Request - ' + l.FirstName + ' ' + l.LastName,
                Status = 'New',
                Origin = 'Website',
                ContactId = con.Id,
                Description = l.Description
            ));
        }
    }

    if (!casesToInsert.isEmpty()) {
        insert casesToInsert;
    }
}

    public static void sendNewPatientEmails(List<Lead> leads) {
        List<Messaging.SingleEmailMessage> emails = new List<Messaging.SingleEmailMessage>();

        for (Lead l : leads) {
            String patientName = l.FirstName + ' ' + l.LastName;

       // Email to patient
if (String.isNotBlank(l.Email)) {
    Messaging.SingleEmailMessage patientEmail = new Messaging.SingleEmailMessage();
    patientEmail.setToAddresses(new String[] { l.Email });
    patientEmail.setSubject('🩺 Thank You for Registering with Trinity Hope Hospital');

    String patientHtmlBody =
        '<div style="font-family:Arial, sans-serif; background-color:#f9f9f9; padding:30px;">' +
        '  <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; ' +
        '              border:1px solid #ddd; box-shadow:0 4px 12px rgba(0,0,0,0.05); padding:30px;">' +
        '    <div style="text-align:center; margin-bottom:20px;">' +
        '      <img src="https://your-hospital-logo-url" alt="Trinity Hope Hospital" style="max-height:70px;" />' +
        '      <h2 style="color:#2a7f62; margin-top:10px;">Trinity Hope Hospital</h2>' +
        '    </div>' +

        '    <p style="font-size:16px; color:#333;">Dear <strong>' + patientName + '</strong>,</p>' +
        '    <p style="font-size:15px; color:#555; line-height:1.6;">' +
        '      Thank you for choosing <strong>Trinity Hope Hospital</strong>. ' +
        '      We have received your registration request and our medical team will contact you shortly to confirm your appointment.' +
        '    </p>' +

        (String.isNotBlank(l.Description) ?
        '    <div style="margin-top:20px; padding:15px; background:#f4f9f6; border-radius:6px; border-left:4px solid #2a7f62;">' +
        '      <p style="margin:0; font-size:14px; color:#333;"><strong>Reason for Visit:</strong><br/>' + l.Description + '</p>' +
        '    </div>' : '') +

        '    <p style="font-size:14px; color:#777; margin-top:20px;">' +
        '      If you have any urgent concerns, please call our 24/7 helpline: <strong>(+91) 98765 43210</strong>.' +
        '    </p>' +

        '    <p style="margin-top:25px; font-size:15px; color:#333;">Warm regards,<br/><strong>Trinity Hope Hospital Team</strong></p>' +
        '  </div>' +
        '</div>';

    patientEmail.setHtmlBody(patientHtmlBody);
    emails.add(patientEmail);
}

// Email to internal staff
User owner = [SELECT Email, Name FROM User WHERE Id = :l.OwnerId LIMIT 1];
if (String.isNotBlank(owner.Email)) {
    Messaging.SingleEmailMessage staffEmail = new Messaging.SingleEmailMessage();
    staffEmail.setToAddresses(new String[] { owner.Email });
    staffEmail.setSubject('📥 New Patient Lead: ' + patientName);

    String staffHtmlBody =
        '<div style="font-family:Arial, sans-serif; background-color:#f4f4f4; padding:30px;">' +
        '  <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; ' +
        '              border:1px solid #ddd; box-shadow:0 4px 12px rgba(0,0,0,0.05); padding:30px;">' +
        '    <h2 style="color:#2a7f62; margin-bottom:20px;">New Patient Lead Assigned</h2>' +
        '    <table style="width:100%; border-collapse:collapse; font-size:14px; color:#333;">' +
        '      <tr><td style="padding:6px 0; font-weight:bold;">Name:</td><td>' + patientName + '</td></tr>' +
        '      <tr><td style="padding:6px 0; font-weight:bold;">Email:</td><td>' + l.Email + '</td></tr>' +
        '      <tr><td style="padding:6px 0; font-weight:bold;">Phone:</td><td>' + l.Phone + '</td></tr>' +
        '      <tr><td style="padding:6px 0; font-weight:bold;">Gender:</td><td>' + l.HealthCloudGA__Gender__c + '</td></tr>' +
        (String.isNotBlank(l.Description) ?
        '      <tr><td style="padding:6px 0; font-weight:bold;">Reason for Visit:</td><td>' + l.Description + '</td></tr>' : '') +
        '    </table>' +
        '    <p style="margin-top:20px; font-size:14px; color:#777;">' +
        '      Please follow up with the patient promptly to confirm their appointment.' +
        '    </p>' +
        '  </div>' +
        '</div>';

    staffEmail.setHtmlBody(staffHtmlBody);
    emails.add(staffEmail);
}

        }

        if (!emails.isEmpty()) {
            Messaging.sendEmail(emails);
        }
    }
}