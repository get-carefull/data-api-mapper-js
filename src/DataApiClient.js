const {QueryResponse} = require("./outputDataApiBuilder/QueryResponse");
const {DataApiClientException} = require("./exceptions/DataApiClientException");
const {Transaction} = require("./transaction/Transaction")
const {ParameterBuilder} = require("./inputDataApiBuilder/ParameterBuilder")
const { RDSDataClient, ExecuteStatementCommand } = require('@aws-sdk/client-rds-data')


class DataApiClient {

    constructor(secretArn, resourceArn, databaseName, mapper, region) {
        this.secretArn = secretArn
        this.resourceArn = resourceArn
        this.databaseName = databaseName
        this.rdsClient = new RDSDataClient({ region: region })
        this.mapper = mapper
    }

    async query(sql, parameters, mapper){
        const params = new ParameterBuilder().fromQuery(parameters)
        try{
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
                return new QueryResponse().parse(response)
            } else {
                return response.numberOfRecordsUpdated
            }
        }catch (e) {
            console.error(e)
            throw new DataApiClientException('An error occurred while invoking sql', e)
        }

    }

    beginTransaction() {
        return new Transaction(this.secretArn, this.resourceArn, this.databaseName, this.rdsClient, this.mapper)
    }

}

module.exports ={DataApiClient}