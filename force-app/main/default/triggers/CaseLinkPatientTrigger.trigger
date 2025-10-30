trigger CaseLinkPatientTrigger on Case (after insert) {
    System.debug('🚀 CaseLinkPatientTrigger fired. Trigger size: ' + Trigger.new.size());

    if (Trigger.isAfter && Trigger.isInsert) {
        System.debug('📌 Calling CaseLinkPatientHandler.linkPatientsToCases...');
        CaseLinkPatientHandler.linkPatientsToCases(Trigger.new);
        System.debug('✅ Finished processing CaseLinkPatientHandler.');
    }
}