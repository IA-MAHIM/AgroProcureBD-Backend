export function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  })
}

export function errorHandler(error, req, res, next) {
  console.error(error)

  const statusCode = error.statusCode || 500

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error'
  })
}
