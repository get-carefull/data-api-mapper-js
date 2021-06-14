const assert = require("assert");
const {DataApiClient} = require("../src/DataApiClient");

//TODO: Change for use reseau database and load the properties from .env.json
describe('DataApiClientTest', () => {
    const database = 'carefull'
    const resourceArn = 'arn:aws:rds:us-east-1:658335388846:cluster:carefull-dev'
    const secretArn = 'arn:aws:secretsmanager:us-east-1:658335388846:secret:/dev/database/carefull-dev/credentials/root-Ljulx2'
    const region = 'us-east-1'
    const dataApiClient = new DataApiClient(secretArn, resourceArn, database, null, region)

    before(async function () {
        const dropTable = 'DROP TABLE IF EXISTS aurora_data_api_node_test'
        const createTable = 'CREATE TABLE aurora_data_api_node_test (id SERIAL, a_name TEXT, doc JSONB DEFAULT \'{}\', num_numeric NUMERIC (10, 5) DEFAULT 0.0, num_float float, num_integer integer, ts TIMESTAMP WITH TIME ZONE, field_string_null TEXT NULL, field_long_null integer NULL, field_doc_null JSONB NULL, field_boolean BOOLEAN NULL, tz_notimezone TIMESTAMP, a_date DATE);'
        const firstInsert = "INSERT INTO aurora_data_api_node_test (a_name, doc, num_numeric, num_float, num_integer, ts, tz_notimezone, a_date) VALUES ('first row', '{\"string_vale\": \"string1\", \"int_value\": 1, \"float_value\": 1.11}', 1.12345, 1.11, 1, '1976-11-02 08:45:00 UTC', '2021-03-03 15:51:48.082288', '1976-11-02');"
        const secondInsert = "INSERT INTO aurora_data_api_node_test (a_name, doc, num_numeric, num_float, num_integer, ts, tz_notimezone, a_date) VALUES ('second row', '{\"string_vale\": \"string2\", \"int_value\": 2, \"float_value\": 2.22}', 2.22, 2.22, 2, '1976-11-02 08:45:00 UTC', '2021-03-03 15:51:48.082288', '1976-11-02');"
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
            const resultRowsExpected = [[{"name":"id","value":1,"tableName":"aurora_data_api_node_test","typeDbName":"serial","nullable":false,"typeDataApi":"serial"},{"name":"a_name","value":"first row","tableName":"aurora_data_api_node_test","typeDbName":"text","nullable":true,"typeDataApi":"text"},{"name":"doc","value":"{\"int_value\": 1, \"float_value\": 1.11, \"string_vale\": \"string1\"}","tableName":"aurora_data_api_node_test","typeDbName":"jsonb","nullable":true,"typeDataApi":"jsonb"},{"name":"num_numeric","value":"1.12345","tableName":"aurora_data_api_node_test","typeDbName":"numeric","nullable":true,"typeDataApi":"numeric"},{"name":"num_float","value":1.11,"tableName":"aurora_data_api_node_test","typeDbName":"float8","nullable":true,"typeDataApi":"float8"},{"name":"num_integer","value":1,"tableName":"aurora_data_api_node_test","typeDbName":"int4","nullable":true,"typeDataApi":"int4"},{"name":"ts","value":"1976-11-02 08:45:00","tableName":"aurora_data_api_node_test","typeDbName":"timestamptz","nullable":true,"typeDataApi":"timestamptz"},{"name":"field_string_null","value":null,"tableName":"aurora_data_api_node_test","typeDbName":"text","nullable":true,"typeDataApi":"text"},{"name":"field_long_null","value":null,"tableName":"aurora_data_api_node_test","typeDbName":"int4","nullable":true,"typeDataApi":"int4"},{"name":"field_doc_null","value":null,"tableName":"aurora_data_api_node_test","typeDbName":"jsonb","nullable":true,"typeDataApi":"jsonb"},{"name":"field_boolean","value":null,"tableName":"aurora_data_api_node_test","typeDbName":"bool","nullable":true,"typeDataApi":"bool"},{"name":"tz_notimezone","value":"2021-03-03 15:51:48.082288","tableName":"aurora_data_api_node_test","typeDbName":"timestamp","nullable":true,"typeDataApi":"timestamp"},{"name":"a_date","value":"1976-11-02","tableName":"aurora_data_api_node_test","typeDbName":"date","nullable":true,"typeDataApi":"date"}]]
            const resultItemsExpected = [{"id":1,"a_name":"first row","doc":{"int_value":1,"float_value":1.11,"string_vale":"string1"},"num_numeric":1.12345,"num_float":1.11,"num_integer":1,"ts":"1976-11-02T11:45:00.000Z","field_string_null":null,"field_long_null":null,"field_doc_null":null,"field_boolean":null,"tz_notimezone":"2021-03-03T18:51:48.082Z","a_date":"1976-11-02"}]
            assert.strictEqual(JSON.stringify(response.rows), JSON.stringify(resultRowsExpected))
            assert.strictEqual(JSON.stringify(response.items), JSON.stringify(resultItemsExpected))
        })
    })
})


