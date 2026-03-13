function loadEnvironment() {
    GLOBAL.tableId = PropertiesService.getScriptProperties().getProperty('TABLE_ID')
    GLOBAL.booksSheet = PropertiesService.getScriptProperties().getProperty('BOOKS_SHEET')
    GLOBAL.themesSheet = PropertiesService.getScriptProperties().getProperty('THEME_SHEET')
    GLOBAL.offersSheet = PropertiesService.getScriptProperties().getProperty('OFFERS_SHEET')
    GLOBAL.recipientsSheet = PropertiesService.getScriptProperties().getProperty('RECIPIENTS_SHEET')
    GLOBAL.imgDir = PropertiesService.getScriptProperties().getProperty('BOOK_IMAGE_DIR')
    GLOBAL.imgTrashDir = PropertiesService.getScriptProperties().getProperty('BOOK_TRASH_DIR')
    GLOBAL.vkToken = PropertiesService.getScriptProperties().getProperty('VK_TOKEN')
    Logger.log(GLOBAL)
}