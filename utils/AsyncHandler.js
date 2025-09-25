const AsyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise
        .resolve(requestHandler(req,res,next))
        .catch((error)=> next(error))//passing to global error handler if not async controller
    }
}

export {AsyncHandler}