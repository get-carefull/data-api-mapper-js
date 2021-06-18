const assert = require("assert");
const {QueryResponse} = require("../src/outputDataApiBuilder/QueryResponse");

describe('QueryResponseTest', function() {
    it('Obtain query response rows OK', async () => {
        const response = new QueryResponse().parse(exampleResponseDataApi)
        const resultExpected = [[{"name": "id","tableName": "aurora_data_api_node_test","typeDbName": "serial","nullable": false,"typeDataApi": "longValue","value": 1},
            {"name": "a_name","tableName": "aurora_data_api_node_test","typeDbName": "text","nullable": true,"typeDataApi": "stringValue","value": "first row"},
            {"name": "doc","tableName": "aurora_data_api_node_test","typeDbName": "jsonb","nullable": true,"typeDataApi": "stringValue","value": "{\"int_value\": 1, \"float_value\": 1.11, \"string_vale\": \"string1\"}"},
            {"name": "num_numeric","tableName": "aurora_data_api_node_test","typeDbName": "numeric","nullable": true,"typeDataApi": "stringValue","value": "1.12345"},
            {"name": "num_float","tableName": "aurora_data_api_node_test","typeDbName": "float8","nullable": true,"typeDataApi": "doubleValue","value": 1.11},
            {"name": "num_integer","tableName": "aurora_data_api_node_test","typeDbName": "int4","nullable": true,"typeDataApi": "longValue","value": 1},
            {"name": "ts","tableName": "aurora_data_api_node_test","typeDbName": "timestamptz","nullable": true,"typeDataApi": "stringValue","value": "1976-11-02 08:45:00"},
            {"name": "field_string_null","tableName": "aurora_data_api_node_test","typeDbName": "text","nullable": true,"typeDataApi": "isNull","value": null},
            {"name": "field_long_null","tableName": "aurora_data_api_node_test","typeDbName": "int4","nullable": true,"typeDataApi": "isNull","value": null},
            {"name": "field_doc_null","tableName": "aurora_data_api_node_test","typeDbName": "jsonb","nullable": true,"typeDataApi": "isNull","value": null},
            {"name": "field_boolean","tableName": "aurora_data_api_node_test","typeDbName": "bool","nullable": true,"typeDataApi": "isNull","value": null},
            {"name": "tz_notimezone","tableName": "aurora_data_api_node_test","typeDbName": "timestamp","nullable": true,"typeDataApi": "stringValue","value": "2021-03-03 15:51:48.082288"},
            {"name": "a_date","tableName": "aurora_data_api_node_test","typeDbName": "date","nullable": true,"typeDataApi": "stringValue","value": "1976-11-02"}]]
        assert.strictEqual(JSON.stringify(response.rows), JSON.stringify(resultExpected))
    })

    it('Obtain query response items OK', async () => {
        const response = new QueryResponse().parse(exampleResponseDataApi)
        const resultExpected = [{"id":1,"a_name":"first row","doc":{"int_value":1,"float_value":1.11,"string_vale":"string1"},"num_numeric":1.12345,"num_float":1.11,"num_integer":1,"ts":"1976-11-02T11:45:00.000Z","field_string_null":null,"field_long_null":null,"field_doc_null":null,"field_boolean":null,"tz_notimezone":"2021-03-03T18:51:48.082Z","a_date":"1976-11-02"}]
        assert.strictEqual(JSON.stringify(response.items), JSON.stringify(resultExpected))
    })
})


const exampleResponseDataApi = {
    "$metadata": {
        "httpStatusCode": 200,
        "requestId": "46158ebf-4b79-4c24-abc0-cbf9ee2e920b",
        "attempts": 1,
        "totalRetryDelay": 0
    },
    "columnMetadata": [
        {
            "arrayBaseColumnType": 0,
            "isAutoIncrement": true,
            "isCaseSensitive": false,
            "isCurrency": false,
            "isSigned": true,
            "label": "id",
            "name": "id",
            "nullable": 0,
            "precision": 10,
            "scale": 0,
            "schemaName": "",
            "tableName": "aurora_data_api_node_test",
            "type": 4,
            "typeName": "serial"
        },
        {
            "arrayBaseColumnType": 0,
            "isAutoIncrement": false,
            "isCaseSensitive": true,
            "isCurrency": false,
            "isSigned": false,
            "label": "a_name",
            "name": "a_name",
            "nullable": 1,
            "precision": 2147483647,
            "scale": 0,
            "schemaName": "",
            "tableName": "aurora_data_api_node_test",
            "type": 12,
            "typeName": "text"
        },
        {
            "arrayBaseColumnType": 0,
            "isAutoIncrement": false,
            "isCaseSensitive": true,
            "isCurrency": false,
            "isSigned": false,
            "label": "doc",
            "name": "doc",
            "nullable": 1,
            "precision": 2147483647,
            "scale": 0,
            "schemaName": "",
            "tableName": "aurora_data_api_node_test",
            "type": 1111,
            "typeName": "jsonb"
        },
        {
            "arrayBaseColumnType": 0,
            "isAutoIncrement": false,
            "isCaseSensitive": false,
            "isCurrency": false,
            "isSigned": true,
            "label": "num_numeric",
            "name": "num_numeric",
            "nullable": 1,
            "precision": 10,
            "scale": 5,
            "schemaName": "",
            "tableName": "aurora_data_api_node_test",
            "type": 2,
            "typeName": "numeric"
        },
        {
            "arrayBaseColumnType": 0,
            "isAutoIncrement": false,
            "isCaseSensitive": false,
            "isCurrency": false,
            "isSigned": true,
            "label": "num_float",
            "name": "num_float",
            "nullable": 1,
            "precision": 17,
            "scale": 17,
            "schemaName": "",
            "tableName": "aurora_data_api_node_test",
            "type": 8,
            "typeName": "float8"
        },
        {
            "arrayBaseColumnType": 0,
            "isAutoIncrement": false,
            "isCaseSensitive": false,
            "isCurrency": false,
            "isSigned": true,
            "label": "num_integer",
            "name": "num_integer",
            "nullable": 1,
            "precision": 10,
            "scale": 0,
            "schemaName": "",
            "tableName": "aurora_data_api_node_test",
            "type": 4,
            "typeName": "int4"
        },
        {
            "arrayBaseColumnType": 0,
            "isAutoIncrement": false,
            "isCaseSensitive": false,
            "isCurrency": false,
            "isSigned": false,
            "label": "ts",
            "name": "ts",
            "nullable": 1,
            "precision": 35,
            "scale": 6,
            "schemaName": "",
            "tableName": "aurora_data_api_node_test",
            "type": 93,
            "typeName": "timestamptz"
        },
        {
            "arrayBaseColumnType": 0,
            "isAutoIncrement": false,
            "isCaseSensitive": true,
            "isCurrency": false,
            "isSigned": false,
            "label": "field_string_null",
            "name": "field_string_null",
            "nullable": 1,
            "precision": 2147483647,
            "scale": 0,
            "schemaName": "",
            "tableName": "aurora_data_api_node_test",
            "type": 12,
            "typeName": "text"
        },
        {
            "arrayBaseColumnType": 0,
            "isAutoIncrement": false,
            "isCaseSensitive": false,
            "isCurrency": false,
            "isSigned": true,
            "label": "field_long_null",
            "name": "field_long_null",
            "nullable": 1,
            "precision": 10,
            "scale": 0,
            "schemaName": "",
            "tableName": "aurora_data_api_node_test",
            "type": 4,
            "typeName": "int4"
        },
        {
            "arrayBaseColumnType": 0,
            "isAutoIncrement": false,
            "isCaseSensitive": true,
            "isCurrency": false,
            "isSigned": false,
            "label": "field_doc_null",
            "name": "field_doc_null",
            "nullable": 1,
            "precision": 2147483647,
            "scale": 0,
            "schemaName": "",
            "tableName": "aurora_data_api_node_test",
            "type": 1111,
            "typeName": "jsonb"
        },
        {
            "arrayBaseColumnType": 0,
            "isAutoIncrement": false,
            "isCaseSensitive": false,
            "isCurrency": false,
            "isSigned": false,
            "label": "field_boolean",
            "name": "field_boolean",
            "nullable": 1,
            "precision": 1,
            "scale": 0,
            "schemaName": "",
            "tableName": "aurora_data_api_node_test",
            "type": -7,
            "typeName": "bool"
        },
        {
            "arrayBaseColumnType": 0,
            "isAutoIncrement": false,
            "isCaseSensitive": false,
            "isCurrency": false,
            "isSigned": false,
            "label": "tz_notimezone",
            "name": "tz_notimezone",
            "nullable": 1,
            "precision": 29,
            "scale": 6,
            "schemaName": "",
            "tableName": "aurora_data_api_node_test",
            "type": 93,
            "typeName": "timestamp"
        },
        {
            "arrayBaseColumnType": 0,
            "isAutoIncrement": false,
            "isCaseSensitive": false,
            "isCurrency": false,
            "isSigned": false,
            "label": "a_date",
            "name": "a_date",
            "nullable": 1,
            "precision": 13,
            "scale": 0,
            "schemaName": "",
            "tableName": "aurora_data_api_node_test",
            "type": 91,
            "typeName": "date"
        }
    ],
    "numberOfRecordsUpdated": 0,
    "records": [
        [
            {
                "longValue": 1
            },
            {
                "stringValue": "first row"
            },
            {
                "stringValue": "{\"int_value\": 1, \"float_value\": 1.11, \"string_vale\": \"string1\"}"
            },
            {
                "stringValue": "1.12345"
            },
            {
                "doubleValue": 1.11
            },
            {
                "longValue": 1
            },
            {
                "stringValue": "1976-11-02 08:45:00"
            },
            {
                "isNull": true
            },
            {
                "isNull": true
            },
            {
                "isNull": true
            },
            {
                "isNull": true
            },
            {
                "stringValue": "2021-03-03 15:51:48.082288"
            },
            {
                "stringValue": "1976-11-02"
            }
        ]
    ]
}
