const assert = require("assert")
const {DataApiClient} = require("../src/DataApiClient")
const dotenv = require('dotenv')
dotenv.config()

describe('DataApiClientTest', () => {
    const dataApiClient = new DataApiClient(process.env.DB_SECRET_ARN, process.env.DB_RESOURCE_ARN, process.env.DB_DATABASE, process.env.REGION)

    before(async function () {
        const dropTable = 'DROP TABLE IF EXISTS aurora_data_api_node_test'
        const createTable = 'CREATE TABLE aurora_data_api_node_test (id SERIAL, a_name TEXT, doc JSONB DEFAULT \'{}\', num_numeric NUMERIC (10, 5) DEFAULT 0.0, num_float float, num_integer integer, ts TIMESTAMP WITH TIME ZONE, field_string_null TEXT NULL, field_long_null integer NULL, field_doc_null JSONB NULL, field_boolean BOOLEAN NULL, tz_notimezone TIMESTAMP, a_date DATE);'
        const firstInsert = "INSERT INTO aurora_data_api_node_test (a_name, doc, num_numeric, num_float, num_integer, ts, tz_notimezone, a_date) VALUES ('first row', '{\"string_vale\": \"string1\", \"int_value\": 1, \"float_value\": 1.11}', 1.12345, 1.11, 1, '1976-11-02 08:45:00 UTC', '2021-03-03 15:51:48.082288', '1976-11-02') RETURNING a_name;"
        const secondInsert = "INSERT INTO aurora_data_api_node_test (a_name, doc, num_numeric, num_float, num_integer, ts, tz_notimezone, a_date) VALUES ('second row', '{\"string_vale\": \"string2\", \"int_value\": 2, \"float_value\": 2.22}', 2.22, 2.22, 2, '1976-11-02 08:45:00 UTC', '2021-03-03 15:51:48.082288', '1976-11-02') RETURNING a_name;"
        await dataApiClient.query(dropTable)
        await dataApiClient.query(createTable)
        await dataApiClient.query(firstInsert)
        await dataApiClient.query(secondInsert)
    })

    after(async function () {
        await dataApiClient.query('DROP TABLE IF EXISTS aurora_data_api_node_test')
    })

    describe('DataApiClientExecute', function () {

        it('Obtain response OK', async () => {
            const response = await dataApiClient.query('SELECT * FROM aurora_data_api_node_test where id=:id', {id: 1})
            const resultRowsExpected = [[{"name":"id","tableName":"aurora_data_api_node_test","typeDbName":"serial","nullable":false,"typeDataApi":"longValue","value":1},{"name":"a_name","tableName":"aurora_data_api_node_test","typeDbName":"text","nullable":true,"typeDataApi":"stringValue","value":"first row"},{"name":"doc","tableName":"aurora_data_api_node_test","typeDbName":"jsonb","nullable":true,"typeDataApi":"stringValue","value":"{\"int_value\": 1, \"float_value\": 1.11, \"string_vale\": \"string1\"}"},{"name":"num_numeric","tableName":"aurora_data_api_node_test","typeDbName":"numeric","nullable":true,"typeDataApi":"stringValue","value":"1.12345"},{"name":"num_float","tableName":"aurora_data_api_node_test","typeDbName":"float8","nullable":true,"typeDataApi":"doubleValue","value":1.11},{"name":"num_integer","tableName":"aurora_data_api_node_test","typeDbName":"int4","nullable":true,"typeDataApi":"longValue","value":1},{"name":"ts","tableName":"aurora_data_api_node_test","typeDbName":"timestamptz","nullable":true,"typeDataApi":"stringValue","value":"1976-11-02 08:45:00"},{"name":"field_string_null","tableName":"aurora_data_api_node_test","typeDbName":"text","nullable":true,"typeDataApi":"isNull","value":null},{"name":"field_long_null","tableName":"aurora_data_api_node_test","typeDbName":"int4","nullable":true,"typeDataApi":"isNull","value":null},{"name":"field_doc_null","tableName":"aurora_data_api_node_test","typeDbName":"jsonb","nullable":true,"typeDataApi":"isNull","value":null},{"name":"field_boolean","tableName":"aurora_data_api_node_test","typeDbName":"bool","nullable":true,"typeDataApi":"isNull","value":null},{"name":"tz_notimezone","tableName":"aurora_data_api_node_test","typeDbName":"timestamp","nullable":true,"typeDataApi":"stringValue","value":"2021-03-03 15:51:48.082288"},{"name":"a_date","tableName":"aurora_data_api_node_test","typeDbName":"date","nullable":true,"typeDataApi":"stringValue","value":"1976-11-02"}]]
            const resultItemsExpected = [{"id":1,"a_name":"first row","doc":{"int_value":1,"float_value":1.11,"string_vale":"string1"},"num_numeric":1.12345,"num_float":1.11,"num_integer":1,"ts":"1976-11-02T11:45:00.000Z","field_string_null":null,"field_long_null":null,"field_doc_null":null,"field_boolean":null,"tz_notimezone":"2021-03-03T18:51:48.082Z","a_date":"1976-11-02"}]
            assert.strictEqual(JSON.stringify(response.rows), JSON.stringify(resultRowsExpected))
            assert.strictEqual(JSON.stringify(response.items), JSON.stringify(resultItemsExpected))
        })

    })

    describe('DataApiClientRollback', function () {

        it('Transaction rollback OK',   async () => {
            //Init transaction
            const transaction = await dataApiClient.beginTransaction()
            //Insert new row
            const thirdInsert = "INSERT INTO aurora_data_api_node_test (a_name, doc, num_numeric, num_float, num_integer, ts, tz_notimezone, a_date) VALUES ('first row', '{\"string_vale\": \"string1\", \"int_value\": 1, \"float_value\": 1.11}', 1.12345, 1.11, 1, '1976-11-02 08:45:00 UTC', '2021-03-03 15:51:48.082288', '1976-11-02');"
            const response = await transaction.query(thirdInsert)
            console.log(response)
            //Obtain the row and then valid it
            const responseThirdInsert = await transaction.query('SELECT * FROM aurora_data_api_node_test where id=:id', {id: 3})
            const resultRowsExpected = [[{"name":"id","tableName":"aurora_data_api_node_test","typeDbName":"serial","nullable":false,"typeDataApi":"longValue","value":3},{"name":"a_name","tableName":"aurora_data_api_node_test","typeDbName":"text","nullable":true,"typeDataApi":"stringValue","value":"first row"},{"name":"doc","tableName":"aurora_data_api_node_test","typeDbName":"jsonb","nullable":true,"typeDataApi":"stringValue","value":"{\"int_value\": 1, \"float_value\": 1.11, \"string_vale\": \"string1\"}"},{"name":"num_numeric","tableName":"aurora_data_api_node_test","typeDbName":"numeric","nullable":true,"typeDataApi":"stringValue","value":"1.12345"},{"name":"num_float","tableName":"aurora_data_api_node_test","typeDbName":"float8","nullable":true,"typeDataApi":"doubleValue","value":1.11},{"name":"num_integer","tableName":"aurora_data_api_node_test","typeDbName":"int4","nullable":true,"typeDataApi":"longValue","value":1},{"name":"ts","tableName":"aurora_data_api_node_test","typeDbName":"timestamptz","nullable":true,"typeDataApi":"stringValue","value":"1976-11-02 08:45:00"},{"name":"field_string_null","tableName":"aurora_data_api_node_test","typeDbName":"text","nullable":true,"typeDataApi":"isNull","value":null},{"name":"field_long_null","tableName":"aurora_data_api_node_test","typeDbName":"int4","nullable":true,"typeDataApi":"isNull","value":null},{"name":"field_doc_null","tableName":"aurora_data_api_node_test","typeDbName":"jsonb","nullable":true,"typeDataApi":"isNull","value":null},{"name":"field_boolean","tableName":"aurora_data_api_node_test","typeDbName":"bool","nullable":true,"typeDataApi":"isNull","value":null},{"name":"tz_notimezone","tableName":"aurora_data_api_node_test","typeDbName":"timestamp","nullable":true,"typeDataApi":"stringValue","value":"2021-03-03 15:51:48.082288"},{"name":"a_date","tableName":"aurora_data_api_node_test","typeDbName":"date","nullable":true,"typeDataApi":"stringValue","value":"1976-11-02"}]]
            assert.strictEqual(JSON.stringify(responseThirdInsert.rows), JSON.stringify(resultRowsExpected))
            //Do rollback
            await transaction.rollbackTransaction()
            //Use a new dataApiClient and try to get the row inserted. The result should be empty
            const responseThirdInsertDoesntExists = await dataApiClient.query('SELECT * FROM aurora_data_api_node_test where id=:id', {id: 3})
            assert.strictEqual(JSON.stringify(responseThirdInsertDoesntExists.rows), JSON.stringify([]))
        })

    })

    describe('DataApiClientExecuteCommit', function () {

        it('Transaction commit OK',   async () => {
            //Init transaction
            const transaction = await dataApiClient.beginTransaction()
            //Insert new row
            const thirdInsert = "INSERT INTO aurora_data_api_node_test (id, a_name, doc, num_numeric, num_float, num_integer, ts, tz_notimezone, a_date) VALUES (8, 'first row', '{\"string_vale\": \"string1\", \"int_value\": 1, \"float_value\": 1.11}', 1.12345, 1.11, 1, '1976-11-02 08:45:00 UTC', '2021-03-03 15:51:48.082288', '1976-11-02');"
            await transaction.query(thirdInsert)
            //Obtain the row and then valid it
            const responseThirdInsert = await transaction.query('SELECT * FROM aurora_data_api_node_test where id=:id', {id: 8})
            const resultRowsExpected = [[{"name":"id","tableName":"aurora_data_api_node_test","typeDbName":"serial","nullable":false,"typeDataApi":"longValue","value":8},{"name":"a_name","tableName":"aurora_data_api_node_test","typeDbName":"text","nullable":true,"typeDataApi":"stringValue","value":"first row"},{"name":"doc","tableName":"aurora_data_api_node_test","typeDbName":"jsonb","nullable":true,"typeDataApi":"stringValue","value":"{\"int_value\": 1, \"float_value\": 1.11, \"string_vale\": \"string1\"}"},{"name":"num_numeric","tableName":"aurora_data_api_node_test","typeDbName":"numeric","nullable":true,"typeDataApi":"stringValue","value":"1.12345"},{"name":"num_float","tableName":"aurora_data_api_node_test","typeDbName":"float8","nullable":true,"typeDataApi":"doubleValue","value":1.11},{"name":"num_integer","tableName":"aurora_data_api_node_test","typeDbName":"int4","nullable":true,"typeDataApi":"longValue","value":1},{"name":"ts","tableName":"aurora_data_api_node_test","typeDbName":"timestamptz","nullable":true,"typeDataApi":"stringValue","value":"1976-11-02 08:45:00"},{"name":"field_string_null","tableName":"aurora_data_api_node_test","typeDbName":"text","nullable":true,"typeDataApi":"isNull","value":null},{"name":"field_long_null","tableName":"aurora_data_api_node_test","typeDbName":"int4","nullable":true,"typeDataApi":"isNull","value":null},{"name":"field_doc_null","tableName":"aurora_data_api_node_test","typeDbName":"jsonb","nullable":true,"typeDataApi":"isNull","value":null},{"name":"field_boolean","tableName":"aurora_data_api_node_test","typeDbName":"bool","nullable":true,"typeDataApi":"isNull","value":null},{"name":"tz_notimezone","tableName":"aurora_data_api_node_test","typeDbName":"timestamp","nullable":true,"typeDataApi":"stringValue","value":"2021-03-03 15:51:48.082288"},{"name":"a_date","tableName":"aurora_data_api_node_test","typeDbName":"date","nullable":true,"typeDataApi":"stringValue","value":"1976-11-02"}]]
            assert.strictEqual(JSON.stringify(responseThirdInsert.rows), JSON.stringify(resultRowsExpected))
            //Use other dataApiClient to get the row insert with the transaction and the result should be empty
            const responseThirdInsertDoesntExists = await dataApiClient.query('SELECT * FROM aurora_data_api_node_test where id=:id', {id: 8})
            assert.strictEqual(JSON.stringify(responseThirdInsertDoesntExists.rows), JSON.stringify([]))
            //Commit transaction
            await transaction.commitTransaction()
            //Get the row insert with te transaction and should bring me data
            const responseThirdInsertExists = await dataApiClient.query('SELECT * FROM aurora_data_api_node_test where id=:id', {id: 8})
            assert.strictEqual(JSON.stringify(responseThirdInsertExists.rows), JSON.stringify(resultRowsExpected))
        })
    })

    describe('DataApiClientQueryPaginated', function () {

        it('Query Paginated OK',   async () => {
            //Insert new row
            const thirdInsert = "INSERT INTO aurora_data_api_node_test (id, a_name, doc, num_numeric, num_float, num_integer, ts, tz_notimezone, a_date) VALUES (8, 'first row', '{\"string_vale\": \"string1\", \"int_value\": 1, \"float_value\": 1.11}', 1.12345, 1.11, 1, '1976-11-02 08:45:00 UTC', '2021-03-03 15:51:48.082288', '1976-11-02');"
            await dataApiClient.query(thirdInsert)
            //Get the row insert with te transaction and should bring me data
            const response = await dataApiClient.query_paginated('SELECT * FROM aurora_data_api_node_test', [],1)
            assert.strictEqual(response.length, 4)
        })
    })
})


