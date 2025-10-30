public class HlsSeUMCaseStatusAndAssignment_Rows {

    public static void createMatrixRows() {
        // Fetch the CalculationMatrixVersion record
        String matrixVersionName = 'HlsSeUMCaseStatusAndAssignment V1';
        
        List<CalculationMatrixVersion> matrixVersions = [SELECT Id FROM CalculationMatrixVersion WHERE Name = :matrixVersionName LIMIT 1];
        
        // Check if any records were returned
        if (matrixVersions.isEmpty()) {
            System.debug('No CalculationMatrixVersion record found with the name: ' + matrixVersionName);
            throw new CustomException('CalculationMatrixVersion with the name ' + matrixVersionName + ' not found.');
        }
        
        // Get the Id of the first record
        Id matrixVersionId = matrixVersions[0].Id;
        
        List<CalculationMatrixRow> matrixRows = [SELECT Id FROM CalculationMatrixRow WHERE CalculationMatrixVersionId = :matrixVersionId LIMIT 1];

        // Define the data to insert
        List<CalculationMatrixRow> rowsToInsert = new List<CalculationMatrixRow>();

        rowsToInsert.add(new CalculationMatrixRow(
            InputData = '{\"AutoApproved\": \"true\",\"ClinicalComplete\": \"true\"}',
            OutputData = '{\"Owner\": \"UM Intake\",\"Status\": \"Closed\",\"OwnerType\": \"Queue\"}',
            CalculationMatrixVersionId = matrixVersionId
        ));

        rowsToInsert.add(new CalculationMatrixRow(
            InputData = '{\"AutoApproved\": \"true\",\"ClinicalComplete\": \"false\"}',
            OutputData = '{\"Owner\": \"UM Intake\",\"Status\": \"Closed\",\"OwnerType\": \"Queue\"}',
            CalculationMatrixVersionId = matrixVersionId
        ));

        rowsToInsert.add(new CalculationMatrixRow(
            InputData = '{\"AutoApproved\": \"false\",\"ClinicalComplete\": \"true\"}',
            OutputData = '{\"Owner\": \"UM Clinical Review\",\"Status\": \"Nurse Review\",\"OwnerType\": \"Queue\"}',
            CalculationMatrixVersionId = matrixVersionId
        ));

        rowsToInsert.add(new CalculationMatrixRow(
            InputData = '{\"AutoApproved\": \"false\",\"ClinicalComplete\": \"false\"}',
            OutputData = '{\"Owner\": \"audrey.agent@umdevorg-r0.demo\",\"Status\": \"Intake Review\",\"OwnerType\": \"User\"}',
            CalculationMatrixVersionId = matrixVersionId
        ));

        // Insert the records
        if (!rowsToInsert.isEmpty() && matrixRows.isEmpty() ) {
            try {
                insert rowsToInsert; // Use insert instead of upsert
                System.debug('Successfully inserted ' + rowsToInsert.size() + ' CalculationMatrixRow records.');
            } catch (DmlException e) {
                System.debug('Error inserting records: ' + e.getMessage());
            }
        } else {
            System.debug('No rows to insert.');
        }
    }
    
    public static void activateMatrixVersion() {
        String matrixVersionName = 'HlsSeUMCaseStatusAndAssignment V1';
        // Fetch the CalculationMatrixVersion record
        CalculationMatrixVersion versionToUpdate = [SELECT Id, Name, Rank, IsEnabled FROM CalculationMatrixVersion WHERE Name = :matrixVersionName LIMIT 1];
        
        // Set the IsActive field to true
        versionToUpdate.IsEnabled = True;
        versionToUpdate.Rank = 1;
        
        try {
            update versionToUpdate;
            System.debug('Successfully activated CalculationMatrixVersion record with Id: ' + versionToUpdate.Id);
        } catch (DmlException e) {
            System.debug('Error updating CalculationMatrixVersion record: ' + e.getMessage());
        }
    }
    
    // Custom exception class
    public class CustomException extends Exception {}
}