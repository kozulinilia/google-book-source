

function getFullThemes() {
    loadEnvironment();
    const ss = SpreadsheetApp.openById(GLOBAL.tableId);
    const sheet = ss.getSheetByName(GLOBAL.themesSheet);
    const data = sheet.getDataRange().getValues();
    const themes = [];
    for (let i = 1; i < data.length; i++) {
        themes.push(data[i][1])
    }
    return themes;
}

function getNowDate() {
    const now = new Date();

    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()

    return `${day}.${month}.${year}`
}

function postBooksOrderListToGoogleTable(arrayWithBooksForOrder, stringWithNumbersOrderedBooks) {
    loadEnvironment();
    const ss = SpreadsheetApp.openById(GLOBAL.tableId);
    const sheet = ss.getSheetByName(GLOBAL.ordersSheet);
    if (!sheet) {
        throw Error(GLOBAL.ordersSheet + ' не существует')
    }

    const nextOrderNumber = getNextOrderNUmber(sheet);

    saveBooksOrderInGoogleTables(sheet, arrayWithBooksForOrder, nextOrderNumber);

    changeBooksStatusAndOrderNumberInMainGoogleTable(stringWithNumbersOrderedBooks, nextOrderNumber);
}

function saveBooksOrderInGoogleTables(sheet, arrayWithBooksForOrder, nextOrderNumber) {
    const indexOrderNumber = 0;

    arrayWithBooksForOrder[indexOrderNumber] = nextOrderNumber;

    sheet.appendRow(arrayWithBooksForOrder);
}

function getNextOrderNUmber(sheet) {
    const ordersNumbers = sheet.getRange("A2:A" + sheet.getLastRow()).getValues();

    return getMaxValueOfOrdersNumbers(ordersNumbers) + 1;
}

function getMaxValueOfOrdersNumbers(ordersNumbers) {
    let maxNumber = 0;

    ordersNumbers.forEach(number => {
        if (number >= maxNumber) {
            maxNumber = number;
        }
    });

    return Number(maxNumber);
}

function changeBooksStatusAndOrderNumberInMainGoogleTable(stringWithNumbersOrderedBooks, nextOrderNumber) {
    const splitDelimeter = ', ';

    const arrayWithOrderedBooksNumbers = stringWithNumbersOrderedBooks.split(splitDelimeter);
    arrayWithOrderedBooksNumbers.pop();

    const ss = SpreadsheetApp.openById(GLOBAL.tableId);
    const sheet = ss.getSheetByName(GLOBAL.booksSheet);

    const data = sheet.getDataRange().getValues();

    const cell = sheet.getRange(2, 16, 1, 1);

    for (let i = 1; i < data.length; i++) {
        if (arrayWithOrderedBooksNumbers.includes(String(data[i][BOOK_ID_ROW]))) {
            changeBookStatusToReserved(sheet, i);
            addOrderNumberToBook(sheet, i, nextOrderNumber);
        }
    }
}

function changeBookStatusToReserved(sheet, bookRowIndex) {
    sheet.getRange(bookRowIndex + 1, STATE_ROW + 1, 1, 1).setValue(RESERVED_STATUS);
}

function addOrderNumberToBook(sheet, bookRowIndex, nextOrderNumber) {
    sheet.getRange(bookRowIndex + 1, ORDER_COLUMN_NUMBER + 1, 1, 1).setValue(nextOrderNumber);
}

function getDropdownValuesOfLibraries() {
    loadEnvironment();
    const ss = SpreadsheetApp.openById(GLOBAL.tableId);
    const sheet = ss.getSheetByName(GLOBAL.recipientsSheet);

    const data = sheet.getDataRange().getValues();

    return data;
}