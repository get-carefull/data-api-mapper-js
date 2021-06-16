const {QueryResponse} = require("./outputDataApiBuilder/QueryResponse")
const {DataApiClientException} = require("./exceptions/DataApiClientException")
const {Transaction} = require("./dataApiTransaction/Transaction")
const {ParameterBuilder} = require("./inputDataApiBuilder/ParameterBuilder")
const { RDSDataClient, ExecuteStatementCommand } = require('@aws-sdk/client-rds-data')


class DataApiClient {

    constructor(secretArn, resourceArn, databaseName, region) {
        this.secretArn = secretArn
        this.resourceArn = resourceArn
        this.databaseName = databaseName
        this.rdsClient = new RDSDataClient({ region: region })
        this.mapper = null
    }

    async query(sql, parameters){
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

    async beginTransaction() {
        return new Transaction(this.secretArn, this.resourceArn, this.databaseName, this.rdsClient, this.mapper)
    }

    //TODO Check the order about the query
    async query_paginated(sql, parameters, pageSize){
        let offset = 0
        const result = []
        if(!pageSize){
            pageSize = 100
        }
        const sqlPaginated = `${sql} limit ${pageSize} offset ${offset}`
        let response = await this.query(sqlPaginated, parameters)
        response.rows.forEach((element) => {
            result.push(element)
        })
        while(response.rows.length >= pageSize ){
            offset = offset + pageSize
            const sqlPaginated = `${sql} limit ${pageSize} offset ${offset}`
            const responseNew = await this.query(sqlPaginated, parameters)
            responseNew.rows.forEach((element) => {
                result.push(element)
            })
            response = responseNew
        }
        return result
    }

}

module.exports ={DataApiClient}