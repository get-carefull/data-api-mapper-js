const {QueryResponse} = require("../outputBuilder/QueryResponse");
const {DataApiClientException} = require("../exceptions/DataApiClientException");
const {ParameterBuilder} = require("../inputBuilder/ParameterBuilder")
const { BeginTransactionCommand, RollbackTransactionCommand, CommitTransactionCommand } = require('@aws-sdk/client-rds-data')


class Transaction {

    constructor(secretArn, resourceArn, database, rdsClient, mapper) {
        this.secretArn = secretArn
        this.resourceArn = resourceArn
        this.database = database
        this.rdsClient = rdsClient
        this.mapper = mapper
        this.transactionId = rdsClient.beginTransaction({secretArn: secretArn, resourceArn: resourceArn, database: database }).transactionId
    }

    async query(sql, parameters, mappers){
        const params = new ParameterBuilder().fromQuery(parameters)
        const beginTransactionCommand = new BeginTransactionCommand({
            secretArn: this.secretArn,
            database: this.databaseName,
            resourceArn: this.resourceArn,
            transactionId: this.transactionId,
            sql: sql,
            includeResultMetadata: true,
            parameters: params
        })
        try {
            const response = await this.rdsClient.send(beginTransactionCommand)
            const responseFormatJson = JSON.parse(response)
            if(responseFormatJson.columnMetadata) {
                const responseParse = new QueryResponse().parse(responseFormatJson)

            } else {
                return responseFormatJson.numberOfRecordsUpdated
            }
        }catch (e) {
            const { requestId, cfId, extendedRequestId } = e.$metadata
            console.error({ requestId, cfId, extendedRequestId })
            throw new DataApiClientException('An error occurred while invoking sql', e)
        }

    }

    async commitTransaction(){
        const commitTransaction = new CommitTransactionCommand({resourceArn: this.resourceArn, secretArn: this.secretArn, transactionId: this.transactionId})
        const response = await this.rdsClient.send(commitTransaction)
    }

    async rollbackTransaction(){
        const rollbackTransaction = new RollbackTransactionCommand({resourceArn: this.resourceArn, secretArn: this.secretArn, transactionId: this.transactionId})
        const response = await this.rdsClient.send(rollbackTransaction)
    }

}

module.exports ={Transaction}