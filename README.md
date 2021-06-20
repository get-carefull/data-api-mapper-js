# Data API Mapper

The Data API Mapper is a lightweight wrapper for Amazon Aurora Serverless Data API.

## How to use this module

```javascript
dataApiClient = new DataApiClient(secret_arn, databaseArn, databaseName, region)
```

## Running a query ⚙️
Once initialized, running a query is super simple. Use the `query()` method and pass in your SQL statement:

```javascript
result = await dataApiClient.query('SELECT * FROM myTable')
```

By default, this will return the converted elements.

For example, for this database:

```sql
CREATE TABLE aurora_data_api_node_test (id SERIAL, a_name TEXT, doc JSONB DEFAULT '{}', num_numeric NUMERIC (10, 5) DEFAULT 0.0, num_float float, num_integer integer, ts TIMESTAMP WITH TIME ZONE, field_string_null TEXT NULL, field_long_null integer NULL, field_doc_null JSONB NULL, field_boolean BOOLEAN NULL, tz_notimezone TIMESTAMP, a_date DATE);
INSERT INTO aurora_data_api_node_test (a_name, doc, num_numeric, num_float, num_integer, ts, tz_notimezone, a_date) VALUES ('first row', '{"string_vale": "string1", "int_value": 1, "float_value": 1.11}', 1.12345, 1.11, 1, '1976-11-02 08:45:00 UTC', '2021-03-03 15:51:48.082288', '1976-11-02');
```

this query 
```javascript 
await dataApiClient.query("select * from aurora_data_api_node_test")
```

will return this elements:

  * Items:
  ```javascript
    [{
      "id": 1,
      "a_name": "first row",
      "doc": {
        "int_value": 1,
        "float_value": 1.11,
        "string_vale": "string1"
      },
      "num_numeric": 1.12345,
      "num_float": 1.11,
      "num_integer": 1,
      "ts": "1976-11-02T11:45:00.000Z",
      "field_string_null": null,
      "field_long_null": null,
      "field_doc_null": null,
      "field_boolean": null,
      "tz_notimezone": "2021-03-03T18:51:48.082Z",
      "a_date": "1976-11-02"
    }]
  ```

## Running a query with parameters ⚙️

To query with parameters, you can use named parameters in your SQL, and then provide an object containing your parameters as the second argument to the `query()` method and the client does the conversion for you:

```javascript

result = await dataApiClient.query(
    'SELECT * FROM myTable WHERE id = :id',
    { 'id': 2 }
)
```

## Transactions

You can initialize a transaction with this method:

```javascript 
const transaction = await dataApiClient.beginTransaction()
```
and then you can run queries (INSERT,UPDATE,DELETE,SELECT) and finally you can do commit/rollback.

For example:
```javascript 
const transaction = await dataApiClient.beginTransaction()
//Insert new row
const thirdInsert = "INSERT INTO aurora_data_api_node_test (a_name, doc, num_numeric, num_float, num_integer, ts, tz_notimezone, a_date) VALUES ('first row', '{\"string_vale\": \"string1\", \"int_value\": 1, \"float_value\": 1.11}', 1.12345, 1.11, 1, '1976-11-02 08:45:00 UTC', '2021-03-03 15:51:48.082288', '1976-11-02');"
const response = await transaction.query(thirdInsert)
console.log(response)
//Obtain the row and then valid it
const responseThirdInsert = await transaction.query('SELECT * FROM aurora_data_api_node_test where id=:id', {id: 3})
const resultExpected = [{
    "id": 3,
    "a_name": "first row",
    "doc": {
        "int_value": 1,
        "float_value": 1.11,
        "string_vale": "string1"
    },
    "num_numeric": 1.12345,
    "num_float": 1.11,
    "num_integer": 1,
    "ts": "1976-11-02T11:45:00.000Z",
    "field_string_null": null,
    "field_long_null": null,
    "field_doc_null": null,
    "field_boolean": null,
    "tz_notimezone": "2021-03-03T18:51:48.082Z",
    "a_date": "1976-11-02"
}]
assert.strictEqual(JSON.stringify(responseThirdInsert), JSON.stringify(resultExpected))
//Do rollback
await transaction.rollbackTransaction() // or await transaction.commitTransaction()
//Use a new dataApiClient and try to get the row inserted. The result should be empty
const responseThirdInsertDoesntExists = await dataApiClient.query('SELECT * FROM aurora_data_api_node_test where id=:id', {id: 3})
assert.strictEqual(JSON.stringify(responseThirdInsertDoesntExists), JSON.stringify([]))
```

# Authors ✒️

  * Sebastian Sanio
  * Flavio Oliveri
  * Leandro Salomon
  * Ignacio Guido Varela

# Expressions of Gratitude 🎁

* tell others about the project 📢
* Invite someone of the team for a 🍺  or a coffee ☕ .
* etc.

