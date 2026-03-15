class DataFilter {
    constructor({key, value, type = 'id'}) {
        this.key = key
        this.value = value
        this.type = type
    }

    isValid(row) {
        let rowValue = row[this.key] ?? null
        if (!rowValue) {
            return false
        }
        let matchValue = false
        switch (this.type) {
            case 'id':
                return Math.ceil(rowValue) === this.value
            default:
                return row[this.key] === this.value
        }

    }
}

class DataFilters {
    constructor(filters) {
        this.elements = []
        filters.forEach(filter => {
            this.elements.push(new DataFilter(filter))
        })
    }

    isValid(row) {
        if (!this.elements) {
            return true
        }
        return this.elements.every(filter => filter.isValid(row))
    }

    filter(rows) {
        return rows.filter(row => this.isValid(row))
    }
}

function loadSheetData(sheetName, filters) {
    const sheet = getSheetByCustomName(sheetName);
    const data = sheet.getDataRange().getValues();
    const rawHeader = data.shift();
    return {header: rawHeader, data: loadFilteredList(data, filters)}
}

function loadFilteredList(data, filters) {
    const dataFilters = new DataFilters(filters)
    return dataFilters.filter(data)
}

function getLastRowInSheet(sheetName) {
    const sheet = getSheetByCustomName(sheetName)
    const lastRow = sheet.getLastRow();
    if (Math.ceil(lastRow) === 1) {
        return null
    }
    const lastColumn = sheet.getLastColumn();
    const range = sheet.getRange(lastRow, 1, 1, lastColumn);
    const values = range.getValues();
    return values[0];
}

function addRowToSheet(sheetName, row) {
    const sheet = getSheetByCustomName(sheetName)
    sheet.appendRow(row)
}

function updateRowOnSheet(sheetName, row) {
    const sheet = getSheetByCustomName(sheetName)
    sheet.getRange(row[0] + 1, 1, 1, row.length).setValues([row]);
}

function getSheetByCustomName(sheetName) {
    loadEnvironment();
    const ss = SpreadsheetApp.openById(GLOBAL.tableId);
    return ss.getSheetByName(GLOBAL[sheetName]);
}