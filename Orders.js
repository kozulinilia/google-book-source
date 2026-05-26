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
            
            // const book = new BookInst(rawType, data[i])
            // listOfBooksInOrder.push(book.toObj());
            //TODO не работает почему-то этот код, метод возвращает null, видимо что-то с объектом BookInst
        
            listOfBooksInOrder.push({author: data[i][5], name: data[i][6], link: data[i][10], boxNum: data[i][11]});
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

    const nextOrderNumber = getNextOrderNumber(sheet);

    saveBooksOrderInGoogleTables(sheet, arrayWithBooksForOrder, nextOrderNumber);

    changeBooksStatusAndOrderNumberInMainGoogleTable(stringWithNumbersOrderedBooks, nextOrderNumber);
}

function saveBooksOrderInGoogleTables(sheet, arrayWithBooksForOrder, nextOrderNumber) {
    const indexOrderNumber = 0;

    arrayWithBooksForOrder[indexOrderNumber] = nextOrderNumber;

    sheet.appendRow(arrayWithBooksForOrder);
}

function getNextOrderNumber(sheet) {
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

    for (let i = 1; i < data.length; i++) {
        if (arrayWithOrderedBooksNumbers.includes(String(data[i][BOOK_ID_ROW]))) {
            changeBookStatus(sheet, i, RESERVED_STATUS);
            addOrderNumberToBook(sheet, i, nextOrderNumber);
            setActualDateOfBookStatusChanging(sheet, i);
        }
    }
}

function changeBookStatus(sheet, bookRowIndex, newStatus) {
    sheet.getRange(bookRowIndex + 1, STATE_ROW + 1, 1, 1).setValue(newStatus);
}

function addOrderNumberToBook(sheet, bookRowIndex, nextOrderNumber) {
    sheet.getRange(bookRowIndex + 1, ORDER_COLUMN_NUMBER + 1, 1, 1).setValue(nextOrderNumber);
}

function setActualDateOfBookStatusChanging(sheet, bookRowIndex) {
    sheet.getRange(bookRowIndex + 1, DATE_ROW + 1, 1, 1).setValue(new Date());
}

function markBooksFromOrderAsSentInGoogleTable(orderNumber) {
    const ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('TABLE_ID'));
    const sheet = ss.getSheetByName(PropertiesService.getScriptProperties().getProperty('BOOKS_SHEET'));

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
        if (Number(orderNumber) === data[i][ORDER_COLUMN_NUMBER]) {
            changeBookStatus(sheet, i, SENT_STATUS);
            setActualDateOfBookStatusChanging(sheet, i);
        }
    }
}

function markOrderAsSentInGoogleTable(orderNumber) {
    const ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('TABLE_ID'));
    const sheet = ss.getSheetByName(PropertiesService.getScriptProperties().getProperty('ORDERS_SHEET'));

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
        if (Number(orderNumber) === data[i][0]) {
            sheet.getRange(i + 1, 4, 1, 1).setValue('sent');
        }
    }
}

function findBooksByOrderNumber(orderNumber) {
    let booksNumbersArray = [];
    const ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('TABLE_ID'));
    const sheet = ss.getSheetByName(PropertiesService.getScriptProperties().getProperty('BOOKS_SHEET'));

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
        if (Number(orderNumber) === data[i][ORDER_COLUMN_NUMBER]) {
            booksNumbersArray.push(sheet.getRange(i + 1, BOOK_ID_ROW + 1, 1, 1).getValue());
        }
    }

    return booksNumbersArray;
}