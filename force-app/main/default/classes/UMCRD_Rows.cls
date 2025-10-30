public class UMCRD_Rows {

    public static void createMatrixRows() {
        // Fetch the CalculationMatrixVersion record
        String matrixVersionName = 'UMCRD V1';
        
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
            InputData = '{\"CPTCode\": \"00123\",\"PlanType\": \"PPO\",\"Gender\": \"Male\",\"Age\": \"20\",\"ServicingProvider\": \"Bloomington Healthcare\",\"HasHistoricDiagnosis\": \"true\"}',
            OutputData = '{\"PANeeded\": \"auth-needed\",\"DocsNeeded\": \"admin\",\"URLName\": \"MRI Guidelines\",\"URL\": \"https://www.mriguidelines.com\",\"URLType\": \"absolute\"}',
            CalculationMatrixVersionId = matrixVersionId
        ));

        rowsToInsert.add(new CalculationMatrixRow(
            InputData = '{\"CPTCode\": \"00124\",\"PlanType\": \"PPO\",\"Gender\": \"Female\",\"Age\": \"20\",\"ServicingProvider\": \"Bloomington Healthcare\",\"HasHistoricDiagnosis\": \"false\"}',
            OutputData = '{\"PANeeded\": \"conditional\",\"DocsNeeded\": \"clinical\",\"URLName\": \"MRI Guidelines\",\"URL\": \"https://www.mriguidelines.com\",\"URLType\": \"absolute\"}',
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
        String matrixVersionName = 'UMCRD V1';
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