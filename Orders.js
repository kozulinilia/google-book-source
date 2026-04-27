function getOrdersTableData(orderStatus, libId = null) {
    const sheet = getSheetByCustomName("ordersSheet");
    if (!sheet) {
        return []
    }
    const data = sheet.getDataRange().getValues();

    const filteredData = data.filter(row => {
        const statusIndex = 3;
        const matchByStatus = row[statusIndex] === orderStatus;
        const matchByLibId = libId ? row[0] === libId : true;

        return matchByStatus && matchByLibId
    });

    return filteredData;
}

function getListOfBooksInOrder(orderNumber) {
    loadEnvironment();
    const ss = SpreadsheetApp.openById(GLOBAL.tableId);
    const sheet = ss.getSheetByName(GLOBAL.booksSheet);
    const data = sheet.getDataRange().getValues();

    let listOfBooksInOrder = [];

    for (let i = 1; i < data.length; i++) {
        if (data[i][ORDER_COLUMN_NUMBER] === Number(orderNumber)) {
            const book = new BookInst(rawType, data[i])
            listOfBooksInOrder.push(book.toObj());
        }
    }

    return listOfBooksInOrder;
}

function getInformationAboutOrder(orderNumber) {
    const orderIdColumn = 0;

    loadEnvironment();
    const ss = SpreadsheetApp.openById(GLOBAL.tableId);
    const sheet = ss.getSheetByName(GLOBAL.ordersSheet);
    const data = sheet.getDataRange().getValues();

    let infoAboutOrder = [];

    for (let i = 1; i < data.length; i++) {
        if (data[i][orderIdColumn] === Number(orderNumber)) {
            infoAboutOrder = data[i];
        }
    }

    return infoAboutOrder;
}

function postBooksOrderListToGoogleTable(arrayWithBooksForOrder, stringWithNumbersOrderedBooks) {
    const sheet = getSheetByCustomName('ordersSheet')
    if (!sheet) {
        throw Error('страницы ' + GLOBAL.ordersSheet + ' не существует')
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