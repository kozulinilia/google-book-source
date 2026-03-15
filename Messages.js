
class MsgInst {
    constructor(type, data, id = null) {
        switch(type) {
            case rowType:
                this.id = id ? Number(id) : Number(data[0])
                this.libId = Number(data[1])
                this.date = data[2]
                this.author = data[3]
                this.vk = data[4]
                this.message = data[5]
                this.vkMessage = data[6]
                break;
            case objType:
                this.id = id ? Number(id) : Number(data.id)
                this.libId = Number(data.libId)
                this.date = data.date
                this.author = data.author
                this.vk = data.vk
                this.message = data.message
                this.vkMessage = data.vkMessage
        }
    }
    toRow() {
        return [
            this.id,
            this.libId,
            this.date,
            this.author,
            this.vk,
            this.message,
            this.vkMessage,
        ]
    }
    toObj() {
        return {
            id: this.id,
            libId: this.libId,
            date: this.date,
            author: this.author,
            vk: this.vk,
            message: this.message,
            vkMessage: this.vkMessage,
        }
    }
}

const msgInfo = {
    sheetName: 'messagesSheet'
};
function loadMsgList(libId) {
    const filters = [{key: 1, value: libId}]
    return loadSheetData(msgInfo.sheetName, filters).data.map(row => (new MsgInst(rowType, row)).toObj())
}

function saveNewMsg(message) {
    let lastRow = getLastRowInSheet(msgInfo.sheetName)
    let nextId = 1
    if (lastRow) {
        lastRow = new MsgInst(rowType, lastRow)
        nextId = Math.ceil(lastRow.id) + 1
    }
    const nextRow = new MsgInst(objType, message, nextId)
    addRowToSheet(msgInfo.sheetName, nextRow.toRow())
    return nextRow.toObj()
}

function saveMsg(message) {
    const messageInst = new MsgInst(objType, message)
    updateRowOnSheet(msgInfo.sheetName, messageInst.toRow())
    return messageInst.toObj()
}