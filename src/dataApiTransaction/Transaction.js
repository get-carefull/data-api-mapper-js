const {QueryResponse} = require("../outputDataApiBuilder/QueryResponse");
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
            database: this.database,
            resourceArn: this.resourceArn,
            transactionId: this.transactionId,
            sql: sql,
            includeResultMetadata: true,
            parameters: params
        })

        const response = await this.rdsClient.send(executeStatementCommand)
        if(response?.columnMetadata) {
            return new QueryResponse().parse(response).items
        } else {
            return response?.numberOfRecordsUpdated
        }

    }

    async batchQuery(sql, parameters){
        await generateTransaction.call(this)
        const paramsDataApi = []
        parameters.forEach((element) => {
            const params = new ParameterBuilder().fromQuery(element)
            paramsDataApi.push(params)
        })

        const executeCommand = new BatchExecuteStatementCommand({
            secretArn: this.secretArn,
            database: this.database,
            resourceArn: this.resourceArn,
            sql: sql,
            includeResultMetadata: true,
            parameterSets: paramsDataApi,
            transactionId: this.transactionId
        })
        const response = await this.rdsClient.send(executeCommand)
        return response?.updateResults?.length

    }

    async commitTransaction(){
        const commitTransaction = new CommitTransactionCommand({resourceArn: this.resourceArn, secretArn: this.secretArn, transactionId: this.transactionId})
        return await this.rdsClient.send(commitTransaction)
    }

    async rollbackTransaction(){
        const rollbackTransaction = new RollbackTransactionCommand({resourceArn: this.resourceArn, secretArn: this.secretArn, transactionId: this.transactionId})
        return await this.rdsClient.send(rollbackTransaction)
    }

}

module.exports ={Transaction}
