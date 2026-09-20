/**
 * Express error-handling middleware for ZSR server.
 * Must have 4 parameters for Express to treat it as an error handler.
 * @param {any} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  res.status(status).json({ error: message })
}
