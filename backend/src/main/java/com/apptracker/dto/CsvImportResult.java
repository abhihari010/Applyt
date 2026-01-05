package com.apptracker.dto;

import java.util.ArrayList;
import java.util.List;

public class CsvImportResult {
    // Result class
    private List<ApplicationDTO> successfulImports = new ArrayList<>();
    private List<ImportError> errors = new ArrayList<>();

    public void addSuccess(ApplicationDTO app) {
        successfulImports.add(app);
    }

    public void addError(int rowNumber, String message) {
        errors.add(new ImportError(rowNumber, message));
    }

    public List<ApplicationDTO> getSuccessfulImports() {
        return successfulImports;
    }

    public List<ImportError> getErrors() {
        return errors;
    }

    public int getSuccessCount() {
        return successfulImports.size();
    }

    public int getErrorCount() {
        return errors.size();
    }

    public int getTotalProcessed() {
        return successfulImports.size() + errors.size();
    }

}
