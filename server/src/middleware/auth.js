export const ensureAuth = (req, res, next) => {
if (req.isAuthenticated?.() && req.user) return next()
return res.status(401).json({ message: 'Unauthorized' })
}


export const getMe = (req, res) => {
return res.json({ user: req.user || null })
}