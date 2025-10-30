trigger PatientLeadTrigger on Lead (after insert, after update) {
    if (Trigger.isAfter && Trigger.isInsert) {
        PatientLeadHandler.sendNewPatientEmails(Trigger.new);
    }

    if (Trigger.isAfter && Trigger.isUpdate) {
        List<Lead> convertedLeads = new List<Lead>();

        for (Lead l : Trigger.new) {
            Lead oldL = Trigger.oldMap.get(l.Id);
            if (l.Status == 'Converted' && oldL.Status != 'Converted') {
                convertedLeads.add(l);
            }
        }

        if (!convertedLeads.isEmpty()) {
            PatientLeadHandler.processLeads(convertedLeads);
        }
    }
}