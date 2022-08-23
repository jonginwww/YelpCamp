class ExpressError extends Error {
    constructor(message, statusCode) {
        super(); // Error 생성자 호출
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;
