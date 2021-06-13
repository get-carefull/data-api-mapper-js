class DataApiClientException {
    constructor(message, exception){
        this.message = message;
        this.name = 'DataApiClientException'
        this.exception = exception
    }
}

module.exports ={DataApiClientException}