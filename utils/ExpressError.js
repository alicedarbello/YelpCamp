class ExpressError extends Error { //Error já é um objeto de express
   constructor(message, status) {
    super();
    this.message = message;
    this.status = status;
   } 
}
module.exports = ExpressError;