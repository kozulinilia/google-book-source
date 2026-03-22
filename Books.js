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
const RESERVED_STATUS = 'reserved';
const NEW_ORDER_STATUS = 'new'

class BookInst {
    constructor(type, data, id = null) {
        this.status = '';
        switch(type) {

            case rowType:
                this.theme = data[0]
                this.author = data[1]
                this.name = data[2]
                this.year = data[3]
                this.annotation = data[4]
                this.link = data[5]
                this.box = data[6]
                this.id = id ? Number(id) : Number(Number(data[7]))
                break;
            case objType:
                this.theme = data.theme
                this.author = data.author
                this.name = data.name
                this.year = data.year
                this.annotation = data.annotation
                this.link = data.link
                this.box = data.box
                this.id = id ? Number(id) : Number(Number(data.id))
            case rawType:
                this.theme = data[THEME_ROW]
                this.author = data[AUTHOR_ROW]
                this.name = data[NAME_ROW]
                this.year = data[YEAR_ROW]
                this.annotation = data[ANNOTATION_ROW]
                this.link = data[LINK_ROW]
                this.box = data[BOX_ROW]
                this.id = id ? Number(id) : Number(Number(data[BOOK_ID_ROW]))
                this.status = data[STATE_ROW]
                break;
        }
    }
    toRow() {
        return [
            this.theme,
            this.author,
            this.name,
            this.year,
            this.annotation,
            this.link,
            this.box,
            this.id,
        ]
    }
    toObj() {
        return {
            theme: this.theme,
            author: this.author,
            name: this.name,
            year: this.year,
            annotation: this.annotation,
            link: this.link,
            box: this.box,
            id: this.id,
        }
    }
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

function addNewBookWithImage() {
    loadEnvironment()
    const lastRow = getLastRowInSheet(GLOBAL.tableId)
}