function loadEnvironment() {
    GLOBAL.tableId = PropertiesService.getScriptProperties().getProperty('TABLE_ID')
    GLOBAL.booksSheet = PropertiesService.getScriptProperties().getProperty('BOOKS_SHEET')
    GLOBAL.themesSheet = PropertiesService.getScriptProperties().getProperty('THEME_SHEET')
    GLOBAL.ordersSheet = PropertiesService.getScriptProperties().getProperty('ORDERS_SHEET')
    GLOBAL.recipientsSheet = PropertiesService.getScriptProperties().getProperty('RECIPIENTS_SHEET')
    GLOBAL.imgDir = PropertiesService.getScriptProperties().getProperty('BOOK_IMAGE_DIR')
    GLOBAL.imgTrashDir = PropertiesService.getScriptProperties().getProperty('BOOK_TRASH_DIR')
    GLOBAL.librarySheet = PropertiesService.getScriptProperties().getProperty('LIBRARY_SHEET')
    GLOBAL.messagesSheet = PropertiesService.getScriptProperties().getProperty('MESSAGES_SHEET')
    GLOBAL.vkToken = PropertiesService.getScriptProperties().getProperty('VK_TOKEN')
    GLOBAL.newBooksDir = PropertiesService.getScriptProperties().getProperty('NEW_BOOKS_DIR')
    Logger.log(GLOBAL)
}