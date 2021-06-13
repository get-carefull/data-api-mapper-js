const {DataApiClientException} = require("./exceptions/DataApiClientException");
const {Transaction} = require("./transaction/Transaction")
const {ParameterBuilder} = require("./inputBuilder/ParameterBuilder")
const { RDSDataClient } = require('@aws-sdk/client-rds-data')

class DataApiClient {

    constructor(secretArn, resourceArn, databaseName, mapper, region) {
        this.secretArn = secretArn
        this.resourceArn = resourceArn
        this.databaseName = databaseName
        this.rdsClient = new RDSDataClient({ region: region })
        this.mapper = mapper
    }

    async query(sql, parameters, mapper, transaction){
        const params = new ParameterBuilder().fromQuery(parameters)
        try{
            const config = this.createConfig(sql, params)
            const response = await this.rdsClient.executeStatement(config)
            const responseFormatJson = JSON.parse(response)
            if(responseFormatJson.columnMetadata) {

            } else {
                return responseFormatJson.numberOfRecordsUpdated
            }
        }catch (e) {
            console.error(e)
            throw new DataApiClientException('An error occurred while invoking sql', e)
        }

    }

    beginTransaction() {
        return new Transaction(this.secretArn, this.resourceArn, this.databaseName, this.rdsClient, this.mapper)
    }

    createConfig(sql, parameters){
        return {
            secretArn: this.secretArn,
            database: this.databaseName,
            resourceArn: this.resourceArn,
            sql: sql,
            includeResultMetadata: true,
            parameters: parameters,
        }
    }


}

module.exports ={DataApiClient}