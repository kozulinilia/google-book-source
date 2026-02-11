const BOOK_ID_ROW = 12;
const STATE_ROW = 14;
const AUTHOR_ROW = 5;
const NAME_ROW = 6;
const YEAR_ROW = 7;
const ANNOTATION_ROW = 8;
const BOX_ROW = 11;
const THEME_ROW = 2;
const LINK_ROW = 10;
const DATE_ROW = 15;
const GLOBAL = {};
const FREE_STATUS = 'free';
const DELETED_STATUS = 'deleted';
const NEW_ORDER_STATUS = 'new'

function doGet(e) {
    return HtmlService
        .createTemplateFromFile("index")
        .evaluate()
        .setTitle("Книжный родник");
}

function getFilteredData(filterTheme = false, status = FREE_STATUS) {
    loadEnvironment();
    const ss = SpreadsheetApp.openById(GLOBAL.tableId);
    const sheet = ss.getSheetByName(GLOBAL.booksSheet);

    const data = sheet.getDataRange().getValues();
    const rawHeader = data.shift();
    const header = convertOutputBookRow(rawHeader);

    const result = data.filter(row => {
        const matchTheme = filterTheme ? row[THEME_ROW].includes(filterTheme) : true;
        const matchStatus = row[STATE_ROW] === status;

        return matchTheme && matchStatus;
    })
        .map(row => convertOutputBookRow(row));

    return {header, rows: result};
}

function getDropdownValues(state) {
    loadEnvironment();
    const ss = SpreadsheetApp.openById(GLOBAL.tableId);
    const sheet = ss.getSheetByName(GLOBAL.booksSheet);

    const data = sheet.getDataRange().getValues();
    var themes = new Map();

    data.filter(v => v[STATE_ROW] === state).forEach(item => {
        var subThemes = item[THEME_ROW].split(', ');
        subThemes.forEach(theme => themes.set(theme, 1));
    })
    const valuesTheme = [...new Set(Array.from(themes.keys()))];

    return valuesTheme;
}

function getDropdownValuesByKey(key) {
    loadEnvironment();
    const ss = SpreadsheetApp.openById(GLOBAL.tableId);
    const sheet = ss.getSheetByName(GLOBAL.booksSheet);

    const data = sheet.getDataRange().getValues();
    var themes = new Map();

    data.forEach(item => {
        var subThemes = item[key].split(', ');
        subThemes.forEach(theme => themes.set(theme, 1));
    })
    const valuesTheme = [...new Set(Array.from(themes.keys()))];

    return valuesTheme;
}

function convertOutputBookRow(row) {
    return [
        row[THEME_ROW],
        row[AUTHOR_ROW],
        row[NAME_ROW],
        row[YEAR_ROW],
        row[ANNOTATION_ROW],
        row[LINK_ROW],
        row[BOX_ROW],
        row[BOOK_ID_ROW],
    ]
}

function addNewBook(id = null) {
    loadEnvironment();
    const ss = SpreadsheetApp.openById(GLOBAL.tableId);
    const sheet = ss.getSheetByName(GLOBAL.booksSheet);
    let newId = 0;
    if (id === null) {
        const data = sheet.getDataRange().getValues();
        newId = 0.0;
        data.forEach(row => {
            if (Number(row[BOOK_ID_ROW])) {
                newId = Math.max(row[BOOK_ID_ROW], newId);
            }
        })
        newId++;
    } else {
        newId = id;
    }
    let row = createBlankRow(Math.ceil(newId));
    sheet.appendRow(row);

    return newId;
}

function saveNewBook(book) {
    book.link = getImageLinkFromFolder(book.id).getUrl();
    book.date = getNowDate()
    let newRow = createRow(book);
    replaceRowById(book.id, newRow);

    return true;
}

function editBook(book) {
    book.date = getNowDate()
    let newRow = createRow(book);
    replaceRowById(book.id, newRow);

    return true;
}

function createBlankRow(id) {
    const row = [];
    for (let i = 0; i < 15; i++) {
        if (Math.ceil(i) === BOOK_ID_ROW) {
            row.push(id)
        } else if (i === STATE_ROW) {
            row.push('free')
        } else {
            row.push('')
        }
    }

    return row;
}

function createRow(param) {
    const row = [];
    for (let i = 0; i < 16; i++) {
        switch (i) {
            case THEME_ROW:
                row.push(param.theme);
                break;
            case BOOK_ID_ROW:
                row.push(param.id);
                break;
            case STATE_ROW:
                row.push('free');
                break;
            case AUTHOR_ROW:
                row.push(param.author);
                break;
            case NAME_ROW:
                row.push(param.name);
                break;
            case YEAR_ROW:
                row.push(param.year);
                break;
            case ANNOTATION_ROW:
                row.push(param.annotation);
                break;
            case BOX_ROW:
                row.push(param.boxNum);
                break;
            case LINK_ROW:
                row.push(param.link);
                break;
            case DATE_ROW:
                row.push(param.date);
                break;
            default:
                row.push('');
        }
    }

    return row;
}

function replaceRowById(id, newRow) {
    loadEnvironment();
    const ss = SpreadsheetApp.openById(GLOBAL.tableId);
    const sh = ss.getSheetByName(GLOBAL.booksSheet);

    const data = sh.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
        if (Math.ceil(data[i][BOOK_ID_ROW]) === Math.ceil(id)) {
            sh.getRange(i + 1, 1, 1, newRow.length).setValues([newRow]);
            return;
        }
    }

    throw new Error("Строка с ID не найдена");
}

function updateByTextFinder(id) {
    loadEnvironment();
    const ss = SpreadsheetApp.openById(GLOBAL.tableId);
    const sh = ss.getSheetByName(GLOBAL.booksSheet);

    const cell = sh
        .getRange('M:M')
        .createTextFinder(id)
        .matchEntireCell(true)
        .findNext();
    if (!cell) {
        return false;
    }
    sh.getRange(cell.getRow(), STATE_ROW + 1).setValue(DELETED_STATUS);
    return true;
}

function deleteRowById(id) {
    id = id.toString()
    updateByTextFinder(id)
    try {
        const file = getImageLinkFromFolder(id);
        moveImageToTrash(file.getId())
    } catch (e) {
    }

    return true;
}

function moveImageToTrash(fileId) {
    loadEnvironment();
    const targetFolder = DriveApp.getFolderById(GLOBAL.imgTrashDir);
    Logger.log('moveImageToTrash', fileId)
    const file = DriveApp.getFileById(fileId)
    Logger.log('file', file)
    const previousParents = file.getParents()
    let parents = []
    while (previousParents.hasNext()) {
        parents.push(previousParents.next().getId());
    }
    parents = parents.join(',')
    Drive.Files.update(
        {},
        fileId,
        null,
        {
            addParents: targetFolder.getId(),
            removeParents: parents
        }
    );
}

function getImageLinkFromFolder(imageId) {
    loadEnvironment();
    const folder = DriveApp.getFolderById(GLOBAL.imgDir);

    const files = folder.getFiles();
    while (files.hasNext()) {
        const file = files.next();

        if (file.getName() === imageId + ".jpg") {
            return file;
        }
    }
    throw new Error("Изображение не найдено");
}

function removeRowById(id) {
    loadEnvironment();
    const ss = SpreadsheetApp.openById(GLOBAL.tableId);
    const sh = ss.getSheetByName(GLOBAL.booksSheet);
    const data = sh.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
        if (Math.ceil(data[i][BOOK_ID_ROW]) === Math.ceil(id)) {
            sh.deleteRow(i + 1);
            return;
        }
    }
}

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

function loadEnvironment() {
    GLOBAL.tableId = PropertiesService.getScriptProperties().getProperty('TABLE_ID')
    GLOBAL.booksSheet = PropertiesService.getScriptProperties().getProperty('BOOKS_SHEET')
    GLOBAL.themesSheet = PropertiesService.getScriptProperties().getProperty('THEME_SHEET')
    GLOBAL.offersSheet = PropertiesService.getScriptProperties().getProperty('OFFERS_SHEET')
    GLOBAL.recipientsSheet = PropertiesService.getScriptProperties().getProperty('RECIPIENTS_SHEET')
    GLOBAL.imgDir = PropertiesService.getScriptProperties().getProperty('BOOK_IMAGE_DIR')
    GLOBAL.imgTrashDir = PropertiesService.getScriptProperties().getProperty('BOOK_TRASH_DIR')
    Logger.log(GLOBAL)
}

function include(file, data = {}) {
    const tpl = HtmlService.createTemplateFromFile(file);
    // прокидываем переменные
    Object.assign(tpl, data);

    return tpl.evaluate().getContent();
}

function getNowDate() {
    const now = new Date();

    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()

    return `${day}.${month}.${year}`
}

function postBooksOrderListToGoogleTable(arrayWithBooksForOrder) {
    loadEnvironment();
    const ss = SpreadsheetApp.openById(GLOBAL.tableId);
    const sheet = ss.getSheetByName(GLOBAL.offersSheet);

    clearOrderTableInGoogleTables(sheet);

    saveBooksOrderInGoogleTables(sheet, arrayWithBooksForOrder);

    changeBooksStatusInMainGoogleTable(arrayWithBooksForOrder);
}

function clearOrderTableInGoogleTables(sheet) {
    const cellsForClearing = sheet.getRange(2, 1, 30, 4);
    let emptyArrayForClearing = [];

    for (let i = 0; i < 30; i++) {
        emptyArrayForClearing.push(['', '', '', '']);
    }

    cellsForClearing.setValues(emptyArrayForClearing);
}

function saveBooksOrderInGoogleTables(sheet, arrayWithBooksForOrder) {
    const cellsWithBooks = sheet.getRange(2, 1, 1, 4);

    cellsWithBooks.setValues(arrayWithBooksForOrder);
}

function changeBooksStatusInMainGoogleTable(arrayWithBooksForOrder) {
    const indexOneArrayElement = 0;
    const indexListOrderedBooksNumbers = 2;
    const splitDelimeter = ', ';

    const arrayWithOrderedBooksNumbers = arrayWithBooksForOrder[indexOneArrayElement][indexListOrderedBooksNumbers].split(splitDelimeter);

    const ss = SpreadsheetApp.openById(GLOBAL.tableId);
    const sheet = ss.getSheetByName(GLOBAL.booksSheet);

    const data = sheet.getDataRange().getValues();

    const cell = sheet.getRange(2, 16, 1, 1);

    for (let i = 1; i < data.length; i++) {
        if (arrayWithOrderedBooksNumbers.includes(String(data[i][BOOK_ID_ROW]))) {
            sheet.getRange(i + 1, STATE_ROW + 1, 1, 1).setValue(DELETED_STATUS);
        }
    }
}

function getDropdownValuesOfLibraries() {
    loadEnvironment();
    const ss = SpreadsheetApp.openById(GLOBAL.tableId);
    const sheet = ss.getSheetByName(GLOBAL.recipientsSheet);

    const data = sheet.getDataRange().getValues();

    return data;
}