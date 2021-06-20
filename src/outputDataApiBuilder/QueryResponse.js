class QueryResponse {

    constructor() {
        this.items = []
    }

    parse(response) {
        const metadata = response.columnMetadata
        response.records.forEach(record => {
            const item = {}
            record.forEach((col, index) => {
                const typeDataApi = metadata[index].typeName
                const colName = metadata[index].name
                // this can be returned on demand with a flag
                const attr = {}
                attr[colName] = col.isNull ? null : parserValueFromType(Object.entries(col)[0][1], typeDataApi)
                Object.assign(item, attr)
            })
            this.items.push(item)
        })
        return this
    }
}

// postgresql specific
function parserValueFromType(value, type) {
    switch (type) {
        case 'text':
        case 'serial':
        case 'bool':
            return value
        case 'int4':
            return parseInt(value)
        case 'jsonb':
            return JSON.parse(value)
        case 'numeric':
        case 'float8':
            return parseFloat(value)
        case 'timestamptz':
        case 'timestamp':
            return new Date(value)
        case 'date':
            // TODO: JS doesn't have a Date type (without time), so for now it delegates to the user what to do with it
            return value
        default:
            return value
    }
}

module.exports = {QueryResponse}