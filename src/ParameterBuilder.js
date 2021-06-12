const {ParameterBuilderException} = require("./exceptions/ParameterBuilderException")

class ParameterBuilder {

    constructor() {
        this.parameters = []
        this.objectConstructor = ({}).constructor
    }

    buildMap(name, value, type, hint){
        let valueDataApi = {}
        valueDataApi[type]= value
        if(hint){
            return {name: name, value: valueDataApi, typeHint: hint}
        } else {
            return {name: name, value: valueDataApi}
        }
    }

    //TODO: Check how verify if the value is a timestamp, because the hint is different between dates and timestamp
    add(name, value) {
        switch(typeof value) {
            case 'string':
                this.parameters.push(this.buildMap(name, value, 'stringValue'))
                break
            case 'number':
                if(parseInt(value) === value){
                    this.parameters.push(this.buildMap(name, value, 'longValue'))
                    return
                }
                if (parseFloat(value) === value){
                    this.parameters.push(this.buildMap(name, value, 'doubleValue'))
                    return
                }
                throw new ParameterBuilderException('Invalid value ' + value)
            case 'boolean':
                this.parameters.push(this.buildMap(name, value, 'booleanValue'))
                break
            case 'object':
                if(value === null){
                    this.parameters.push(this.buildMap(name, true, 'isNull'))
                    return
                }
                if(value instanceof Date) {
                    this.parameters.push(this.buildMap(name, value, 'stringValue', 'DATE'))
                    return
                }
                if(Buffer.isBuffer(value)){
                    this.parameters.push(this.buildMap(name, value, 'blobValue'))
                    return
                }
                if(this.objectConstructor === value?.constructor){
                    this.parameters.push(this.buildMap(name, JSON.stringify(value), 'stringValue', 'JSON'))
                    return
                }
                if(Array.isArray(value)){
                    this.parameters.push(this.buildMap(name, value, 'arrayValue'))
                    return
                }
                throw new ParameterBuilderException('Invalid value ' + value)
            default:
                throw new ParameterBuilderException('Invalid value ' + value)
        }
    }

    fromQuery(parameters) {
        if(parameters) {
            for(const [key, value] of Object.entries(parameters)){
                this.add(key,value)
            }
        }
        return this.parameters
    }

    build() {
        return this.parameters
    }

}

module.exports ={ParameterBuilder}