const {QueryMetadata} = require("./QueryMetadata");

class QueryResponse {

    constructor() {
    }

    parse(response) {
        const rows = []
        const metadata = response.columnMetadata
        response.records.forEach((row, index) => {
            const item = []
            row.forEach((col, index) => {
                item.push({
                    name: metadata[index].name,
                    value: Object.entries(col)[0][1],
                    tableName: metadata[index].tableName,
                    typeDbName: metadata[index].typeName,
                    nullable: metadata[index].nullable !== 0,
                    typeDataApi: Object.entries(col)[0].key
                })
            })
            rows.push(item)
        })
        return new QueryMetadata(rows)
    }
}

module.exports = {QueryResponse}