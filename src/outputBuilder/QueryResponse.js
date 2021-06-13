const {QueryMetadata} = require("./QueryMetadata");

class QueryResponse {

    constructor() {
    }

    parse(response){
        const rows = []
        const records = response.records
        response.columnMetadata.forEach((element, index) => {
            rows.push({name: element.name, tableName: element.tableName, typeDbName: element.typeName, nullable: element.nullable !== 0, typeDataApi: Object.keys(records[0][index])[0], value: Object.values(records[0][index])[0]})
        })
        return new QueryMetadata(rows)
    }
}

module.exports ={QueryResponse}