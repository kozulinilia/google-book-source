function moveImageToTrash(fileId) {
    loadEnvironment();
    const targetFolder = DriveApp.getFolderById(GLOBAL.imgTrashDir);
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