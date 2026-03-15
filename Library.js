const rowType = 'row'
const objType = 'obj'
class LibInst {
    constructor(type, data, id = null) {
        switch(type) {
            case rowType:
                this.id = id ? Number(id) : Number(Number(data[0]))
                this.region = data[1]
                this.name = data[2]
                this.post = data[3]
                this.vk = data[4]
                this.contact = data[5]
                break;
            case objType:
                this.id = id ? Number(id) : Number(Number(data.id))
                this.region = data.region
                this.name = data.name
                this.post = data.post
                this.vk = data.vk
                this.contact = data.contact
        }
    }
    toRow() {
        return [
            this.id,
            this.region,
            this.name,
            this.post,
            this.vk,
            this.contact,
        ]
    }
    toObj() {
        return {
            id: this.id,
            region: this.region,
            name: this.name,
            post: this.post,
            vk: this.vk,
            contact: this.contact,
        }
    }
}

const libInfo = {
    sheetName: 'librarySheet'
};
function loadLibList(filters = []) {
    return loadSheetData(libInfo.sheetName, filters)
}

function findOneLib(libId) {
    const filters = [{key: 0, value: libId}]
    return loadLibList(filters).data.map(row => (new LibInst(rowType, row)).toObj())
}

function saveNewLib(library) {
    let lastRow = getLastRowInSheet(libInfo.sheetName)
    let nextId = 1
    if (lastRow) {
        lastRow = new LibInst(rowType, lastRow)
        nextId = Math.ceil(lastRow.id) + 1
    }
    const nextRow = new LibInst(objType, library, nextId)
    addRowToSheet(libInfo.sheetName, nextRow.toRow())
    return nextRow.toObj()
}

function saveLib(library) {
    const libraryInst = new LibInst(objType, library)
    updateRowOnSheet(libInfo.sheetName, libraryInst.toRow())
    return libraryInst.toObj()
}