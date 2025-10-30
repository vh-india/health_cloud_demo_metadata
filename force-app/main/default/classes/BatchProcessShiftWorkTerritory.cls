global class BatchProcessShiftWorkTerritory implements Database.Batchable<SObject> {
  global Database.QueryLocator start(Database.BatchableContext BC) {
    return Database.getQueryLocator(
      [SELECT Id FROM Shift ]
    );
  }

  global void execute(Database.BatchableContext BC, List<SObject> scope) {
    List<String> shiftIds = new List<String>();
 
    for (Shift shift : (List<Shift>) scope) {
      shiftIds.add(shift.Id);
    }

    List<ShiftWorkTopic> shiftWorkTopicsWithAllTopicsSupported = [
      SELECT Id, ShiftId, WorkTypeId
      FROM ShiftWorkTopic
      WHERE AreAllTopicsSupported = TRUE AND ShiftId IN :shiftIds
    ];

    List<ShiftWorkTopic> shiftWorkTopicsWithAllTopicsNotSupported = [
      SELECT WorkTypeId, ShiftId
      FROM ShiftWorkTopic
      WHERE AreAllTopicsSupported = FALSE AND ShiftId IN :shiftIds
    ];

    List<ShiftWorkTopic> newShiftWorkTopics = new List<ShiftWorkTopic>();

    List<WorkType> allWorkTypes = [
      SELECT Id
      FROM WorkType
    ];

    Set<Set<String>> allCombinationsOfWorkTypeAndShift = new Set<Set<String>>();

    for (ShiftWorkTopic swt : shiftWorkTopicsWithAllTopicsNotSupported) {
      allCombinationsOfWorkTypeAndShift.add(
        new Set<String>{ swt.WorkTypeId, swt.ShiftId }
      );
    }

    // Loop through enabled ShiftWorkTopics and all WorkTypes
      for (
        ShiftWorkTopic enabledTopic : shiftWorkTopicsWithAllTopicsSupported
      ) {

        for (WorkType workType : allWorkTypes) {
          if (
            !allCombinationsOfWorkTypeAndShift.contains(
              new Set<String>{ workType.Id, enabledTopic.ShiftId }
            )
          ) {
            newShiftWorkTopics.add(
              new ShiftWorkTopic(
                WorkTypeId = workType.Id,
                ShiftId = enabledTopic.ShiftId
              )
            );
          } 
        }
      }

    insert newShiftWorkTopics;
    
    delete shiftWorkTopicsWithAllTopicsSupported;
  }

  global void finish(Database.BatchableContext BC) {
    // Send notification or log the completion
    System.debug('Batch job completed successfully.');
  }
}