const {ParameterBuilder} = require("./ParameterBuilder")

class DataApiClient {

    constructor(rdsClient, secretArn, clusterArn, databaseName, mapper) {
        this.rdsClient = rdsClient
        this.secretArn = secretArn
        this.clusterArn = clusterArn
        this.databaseName = databaseName
        this.mapper = mapper
    }

    query(sql, parameters, mapper, transaction){
        const params = new ParameterBuilder().fromQuery(parameters)
        const config = this.createConfig(sql, params)
        //TODO Check how manage this, because if the rdsClient can change maybe the method that we need to invoke too.
        // Currently executeStatement is not the correct method ( I don't know the method ). Maybe exists a generic method.
        const response = this.rdsClient.executeStatement()

    }

    createConfig(sql, parameters){
        return {
            secretArn: this.secretArn,
            database: this.databaseName,
            resourceArn: this.clusterArn,
            sql: sql,
            includeResultMetadata: true,
            parameters: parameters,

        }
    }


}

module.exports ={DataApiClient}