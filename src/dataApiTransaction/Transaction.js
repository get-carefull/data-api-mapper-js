const {QueryResponse} = require("../outputDataApiBuilder/QueryResponse");
const {DataApiClientException} = require("../exceptions/DataApiClientException");
const {ParameterBuilder} = require("../inputDataApiBuilder/ParameterBuilder")
const { BeginTransactionCommand, RollbackTransactionCommand, CommitTransactionCommand, ExecuteStatementCommand, BatchExecuteStatementCommand } = require('@aws-sdk/client-rds-data')


async function generateTransaction() {
    if (!this.transactionId) {
        const beginTransactionCommand = new BeginTransactionCommand({
            secretArn: this.secretArn,
            database: this.database,
            resourceArn: this.resourceArn
        })
        const response = await this.rdsClient.send(beginTransactionCommand)
        this.transactionId = response.transactionId
    }
}

class Transaction {

    constructor(secretArn, resourceArn, database, rdsClient) {
        this.secretArn = secretArn
        this.resourceArn = resourceArn
        this.database = database
        this.rdsClient = rdsClient
        this.transactionId = null
    }

    async query(sql, parameters){
        await generateTransaction.call(this)
        const params = new ParameterBuilder().fromQuery(parameters)
        const executeStatementCommand = new ExecuteStatementCommand({
            secretArn: this.secretArn,
            database: this.databaseName,
            resourceArn: this.resourceArn,
            transactionId: this.transactionId,
            sql: sql,
            includeResultMetadata: true,
            parameters: params
        })
        try {
            const response = await this.rdsClient.send(executeStatementCommand)
            if(response?.columnMetadata) {
                return new QueryResponse().parse(response).items
            } else {
                return response?.numberOfRecordsUpdated
            }
        }catch (e) {
            console.error(e)
            throw new DataApiClientException('An error occurred while invoking sql', e)
        }

    }

    async batchInsert(sql, parameters){
        await generateTransaction.call(this)
        const paramsDataApi = []
        parameters.forEach((element) => {
            const params = new ParameterBuilder().fromQuery(element)
            paramsDataApi.push(params)
        })
        try{
            const executeCommand = new BatchExecuteStatementCommand({
                secretArn: this.secretArn,
                database: this.databaseName,
                resourceArn: this.resourceArn,
                sql: sql,
                includeResultMetadata: true,
                parameterSets: paramsDataApi,
                transactionId: this.transactionId
            })
            const response = await this.rdsClient.send(executeCommand)
            return response?.updateResults?.length
        }catch (e) {
            console.error(e)
            throw new DataApiClientException('An error occurred while invoking sql', e)
        }
    }

    async commitTransaction(){
        const commitTransaction = new CommitTransactionCommand({resourceArn: this.resourceArn, secretArn: this.secretArn, transactionId: this.transactionId})
        const response = await this.rdsClient.send(commitTransaction)
        return response
    }

    async rollbackTransaction(){
        const rollbackTransaction = new RollbackTransactionCommand({resourceArn: this.resourceArn, secretArn: this.secretArn, transactionId: this.transactionId})
        const response = await this.rdsClient.send(rollbackTransaction)
        return response
    }

}

module.exports ={Transaction}