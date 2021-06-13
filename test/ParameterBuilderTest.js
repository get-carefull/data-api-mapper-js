const assert = require('assert')
const {ParameterBuilder} = require("../src/inputDataApiBuilder/ParameterBuilder")

describe('ParameterBuilderTest', () => {
    it('should create correct build', () => {
        const parameterBuilder = new ParameterBuilder()
        const date = new Date()
        const parameters = parameterBuilder.fromQuery({long: 3, string: 'Test', date: date, jsonb: {id: 1, account: 'account'}, float: 1.31, null: null})
        assert.strictEqual(JSON.stringify(parameters), JSON.stringify([
            {name: 'long', value: {'longValue': 3}},
            {name: 'string', value: {'stringValue': 'Test'}},
            {name: 'date', value: {'stringValue': date.toISOString()}, typeHint: 'DATE'},
            {name: 'jsonb', value: {'stringValue': '{"id":1,"account":"account"}'}, typeHint: 'JSON'},
            {name: 'float', value: {'doubleValue': 1.31}},
            {name: 'null', value: {'isNull': true}},
            ]))
    })
})
