function doGet() {
    return HtmlService.createHtmlOutputFromFile('index')
}

// Возвращает HTML как строку
function loadPage(name) {
    return HtmlService.createTemplateFromFile(name).evaluate().getContent();
}

function include(file, data = {}) {
    const tpl = HtmlService.createTemplateFromFile(file);
    // прокидываем переменные
    Object.assign(tpl, data);

    return tpl.evaluate().getContent();
}