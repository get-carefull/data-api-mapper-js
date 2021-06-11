const {RDSDataClient, ExecuteStatementCommand} = require('@aws-sdk/client-rds-data');

const error = (...err) => {
    throw Error(...err)
}

const supportedTypes = [
    'arrayValue',
    'blobValue',
    'booleanValue',
    'doubleValue',
    'isNull',
    'longValue',
    'stringValue',
    'structValue'
]

class Client {
    constructor(config) {
        typeof config !== 'object' ? error('config is missing') : null
        this.client = typeof config.client !== 'undefined' ? config.client : error('client is missing')
        this.engine = typeof config.engine === 'string' ? config.engine : 'postgresql'
        this.params = {
            secretArn: config.secretArn,
            resourceArn: config.resourceArn,
            database: config.database
        }
        Object.keys(this.params).forEach(key => this.params[key] ? '' : delete this.params[key])
    }

    query = async function (sql, parameters, ..._args) {
        const sqlParams = this.getSqlParams(sql)
        const statement = {
            ...this.params,
            sql: sql,
            parameters: []
        }

        typeof parameters === 'object' ? statement['parameters'] = assembleParams(sqlParams, parameters) : null
        const command = new ExecuteStatementCommand(statement)
        return statement
    }

    getSqlParams = sql => (sql.match(/:{1,2}\w+/g) || []).filter(a => !a.startsWith('::')).map(a => a.replace(':', ''))

//     export enum TypeHint {
//     DATE = "DATE",
//     DECIMAL = "DECIMAL",
//     JSON = "JSON",
//     TIME = "TIME",
//     TIMESTAMP = "TIMESTAMP",
//     UUID = "UUID",
// }


}

const assembleParams = (sqlParams, parameters) => {
    return sqlParams.reduce((plist, p) => {
        const value = {}
        value[getType(parameters[p])] = parameters[p]
        plist.push({
            name: p,
            value: value
        })
        return plist
    }, [])
}

const getType = val =>
    typeof val === 'string' ? 'stringValue'
        : typeof val === 'boolean' ? 'booleanValue'
        : typeof val === 'number' && parseInt(val) === val ? 'longValue'
            : typeof val === 'number' && parseFloat(val) === val ? 'doubleValue'
                : val === null ? 'isNull'
                    : isDate(val) ? 'stringValue'
                        : Buffer.isBuffer(val) ? 'blobValue'
                            : typeof val === 'object'
                            && Object.keys(val).length === 1
                            && supportedTypes.includes(Object.keys(val)[0]) ? null
                                : undefined

const isDate = val => val instanceof Date

async function init() {
    const client = new Client({client: new RDSDataClient()})
    await client.query('select * from fafaf where id = :id::uuid and fafa = :fafa', {
        id: 'someId',
        fafa: new Date(),
    })
}

init()
