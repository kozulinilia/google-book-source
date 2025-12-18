const BOOK_ID_ROW = 12;
const STATE_ROW = 14;
const AUTHOR_ROW = 5;
const NAME_ROW = 6;
const YEAR_ROW = 7;
const ANNOTATION_ROW = 8;
const BOX_ROW = 11;
const THEME_ROW = 2;
const LINK_ROW = 10;
const TABLE_ID = "1D6J9Li4ZPOh8QSavuVDAvigjBg61ikKpe2BCkVrUdpA";
const BOOKS_SHEET = "список"
const THEME_SHEET = "рубрикатор (альт)"
const BOOK_IMAGE_DIR_ID = "1fnUMKXpSdhLbuF4WZZgSJWb7vFvFCIX5";

function doGet(e) {
  return HtmlService
    .createTemplateFromFile("index")
    .evaluate()
    .setTitle("Фильтры из таблицы");
}

function getFilteredData(filterTheme = false) {
  filterStatus = 'free';
  const ss = SpreadsheetApp.openById(TABLE_ID);
  const sheet = ss.getSheetByName(BOOKS_SHEET);

  const data = sheet.getDataRange().getValues();
  const rawHeader = data.shift();
  const header = [
    rawHeader[2],
    rawHeader[5],
    rawHeader[6],
    rawHeader[7],
    rawHeader[8],
    rawHeader[10],
    rawHeader[12]
  ];
  Logger.log(header)
  const colTheme = 2;
  const colStatus = 14;

  const result = data.filter(row => {
    const matchTheme = filterTheme ? row[colTheme].includes(filterTheme) : true;
    const matchStatus = row[STATE_ROW] === "free";

    return matchTheme && matchStatus;
  })
    .map(row => [
      row[2],
      row[5],
      row[6],
      row[7],
      row[8],
      row[10],
      row[12],
    ]);

  return { header, rows: result };
}

function getDropdownValues() {
  const ss = SpreadsheetApp.openById(TABLE_ID);
  const sheet = ss.getSheetByName(BOOKS_SHEET);

  const data = sheet.getDataRange().getValues();
  var themes = new Map();

  data.filter(v => v[STATE_ROW] === 'free').forEach(item => {
    var subThemes = item[THEME_ROW].split(', ');
    subThemes.forEach(theme => themes.set(theme, 1));
  })
  const valuesTheme = [...new Set(Array.from(themes.keys()))];

  return valuesTheme ;
}

function addNewBook(id = null) {
  const ss = SpreadsheetApp.openById(TABLE_ID);
  const sheet = ss.getSheetByName(BOOKS_SHEET);
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
  book.link = getImageLinkFromFolder(book.id);
  let newRow = createRow(book);
  Logger.log(book);
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
  for (let i = 0; i < 15; i++) {
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
      default:
        row.push('');
    }
  }

  return row;
}

function replaceRowById(id, newRow) {
  const ss = SpreadsheetApp.openById(TABLE_ID);
  const sh = ss.getSheetByName(BOOKS_SHEET);

  const data = sh.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (Math.ceil(data[i][BOOK_ID_ROW]) === Math.ceil(id)) {
      sh.getRange(i + 1, 1, 1, newRow.length).setValues([newRow]);
      return;
    }
  }

  throw new Error("Строка с ID не найдена");
}

function getImageLinkFromFolder(imageId) {
  const folder = DriveApp.getFolderById(BOOK_IMAGE_DIR_ID);

  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();

    if (file.getName() === imageId + ".jpg") {
      return file.getUrl();
    }
  }
  throw new Error("Изображение не найдено");
}

function removeRowById(id) {
  const ss = SpreadsheetApp.openById(TABLE_ID);
  const sh = ss.getSheetByName(BOOKS_SHEET);
  const data = sh.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (Math.ceil(data[i][BOOK_ID_ROW]) === Math.ceil(id)) {
      sh.deleteRow(i + 1);
      return;
    }
  }
}

function getFullThemes() {
    const ss = SpreadsheetApp.openById(TABLE_ID);
      const sheet = ss.getSheetByName(THEME_SHEET);
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
    GLOBAL.imgDir = PropertiesService.getScriptProperties().getProperty('BOOK_IMAGE_DIR')
    Logger.log(GLOBAL)
}