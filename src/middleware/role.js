export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission for this action'
      })
    }

    next()
  }
}

export function requireActiveAccount(req, res, next) {
  if (req.user.account_status !== 'active') {
    return res.status(403).json({
      success: false,
      message: `Account is not active. Current status: ${req.user.account_status}`
    })
  }

  next()
}
