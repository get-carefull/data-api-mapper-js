const {QueryResponse} = require("./outputDataApiBuilder/QueryResponse")
const {Transaction} = require("./dataApiTransaction/Transaction")
const {ParameterBuilder} = require("./inputDataApiBuilder/ParameterBuilder")
const { RDSDataClient, ExecuteStatementCommand, BatchExecuteStatementCommand } = require('@aws-sdk/client-rds-data')


class DataApiClient {

    constructor(secretArn, databaseArn, databaseName, region) {
        this.secretArn = secretArn
        this.resourceArn = databaseArn
        this.databaseName = databaseName
        this.rdsClient = new RDSDataClient({ region: region })
        this.mapper = null
    }

    async query(sql, parameters){
        const params = new ParameterBuilder().fromQuery(parameters)

        const executeCommand = new ExecuteStatementCommand({
                secretArn: this.secretArn,
                database: this.databaseName,
                resourceArn: this.resourceArn,
                sql: sql,
                includeResultMetadata: true,
                parameters: params,
             })
        const response = await this.rdsClient.send(executeCommand)
        if(response?.columnMetadata) {
            return new QueryResponse().parse(response).items
        } else {
            return response.numberOfRecordsUpdated
        }

    }

    async batchQuery(sql, parameters){
        const paramsDataApi = []
        parameters.forEach((element) => {
            const params = new ParameterBuilder().fromQuery(element)
            paramsDataApi.push(params)
        })

        const executeCommand = new BatchExecuteStatementCommand({
            secretArn: this.secretArn,
            database: this.databaseName,
            resourceArn: this.resourceArn,
            sql: sql,
            includeResultMetadata: true,
            parameterSets: paramsDataApi,
        })
        const response = await this.rdsClient.send(executeCommand)
        return response?.updateResults?.length

    }

    async beginTransaction() {
        return new Transaction(this.secretArn, this.resourceArn, this.databaseName, this.rdsClient, this.mapper)
    }

    async queryPaginated(sql, parameters, pageSize){
        let offset = 0
        const result = []
        if(!pageSize){
            pageSize = 100
        }
        const sqlPaginated = `${sql} limit ${pageSize} offset ${offset}`
        let response = await this.query(sqlPaginated, parameters)
        response.forEach((element) => {
            result.push(element)
        })
        while(response.length >= pageSize ){
            offset = offset + pageSize
            const sqlPaginated = `${sql} limit ${pageSize} offset ${offset}`
            const responseNew = await this.query(sqlPaginated, parameters)
            responseNew.forEach((element) => {
                result.push(element)
            })
            response = responseNew
        }
        return result
    }

}

module.exports ={DataApiClient}
