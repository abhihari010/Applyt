package com.apptracker.dto;

public class ImportError {
    private int rowNumber;
    private String message;

    public ImportError(int rowNumber, String message) {
        this.rowNumber = rowNumber;
        this.message = message;
    }

    public int getRowNumber() {
        return rowNumber;
    }

    public String getMessage() {
        return message;
    }

}
