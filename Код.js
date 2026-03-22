

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