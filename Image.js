function moveImageToFolder(dirName, fileId) {
    loadEnvironment();
    const targetFolder = DriveApp.getFolderById(dirName);
    const file = DriveApp.getFileById(fileId)
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

function getImageFile(link) {
    const fileId = link.match(/[-\w]{25,}/);
    return DriveApp.getFileById(fileId)
}

function getImage(link) {
    const file = getImageFile(link)
    const blob = file.getBlob();
    return "data:" + blob.getContentType() + ";base64," +
        Utilities.base64Encode(blob.getBytes());
}

function getDoubleImages() {
    loadEnvironment()
    const folder = DriveApp.getFolderById(GLOBAL.imgDir);
    const files = folder.getFiles();
    const doubleFileIds = []
    const filesMap = new Map()
    while (files.hasNext()) {
        const file = files.next();
        if (filesMap.get(file.getName())) {
            doubleFileIds.push(file.getName())
        } else {
            filesMap.set(file.getName(), file.getName())
        }
    }
    return doubleFileIds
}

function loadGroupBooksByBox(boxNum) {
    let bookSheet = 'booksSheet'
    loadEnvironment()
    const srcFolder = DriveApp.getFolderById(GLOBAL.newBooksDir);
    let files = srcFolder.getFiles();
    let row = 0;
    while (files.hasNext()) {
        let imgFile = files.next();
        let link = imgFile.getUrl()
        let mime = imgFile.getMimeType();
        if (mime.indexOf("image/") === -1) {
            continue;
        }
            let text = parseTextFromImage(imgFile).replace(/\n/g, " ");
            let lastRow = getLastRowInSheet(bookSheet);
            let nextId = 1;
            if (lastRow) {
                lastRow = new BookInst(rowType, lastRow)
                nextId = Math.ceil(lastRow.id) + 1
            }
            imgFile.setName(`${nextId}.jpg`);
            const nextRow = new BookInst(
                objType,
                {name: text, boxNum: boxNum, link, date: getNowDate()},
                nextId
            );
            addRowToSheet(bookSheet, createRow(nextRow));
            moveImageToFolder(GLOBAL.imgDir, imgFile.getId())
            row++;
    }

    return row;
}

function parseTextFromImage(imgFile) {
    let blob = imgFile.getBlob();
    let resource = {
        title: imgFile.getName(),
        mimeType: MimeType.GOOGLE_DOCS
    };
    let docFile = Drive.Files.create(resource, blob, {
        ocr: true,
        ocrLanguage: 'ru'
    });
    let doc = DocumentApp.openById(docFile.id);
    let text = doc.getBody().getText();
    DriveApp.getFileById(docFile.id).setTrashed(true);
    return text;
}