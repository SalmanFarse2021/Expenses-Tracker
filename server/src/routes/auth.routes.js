import { Router } from 'express'
import passport from 'passport'
import { getMe } from '../middleware/auth.js'


const router = Router()


router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))


router.get(
'/google/callback',
passport.authenticate('google', { failureRedirect: '/login' }),
(req, res) => {
// Successful auth -> redirect to client
res.redirect(process.env.CLIENT_URL)
}
)


router.get('/me', getMe)
router.post('/logout', (req, res, next) => {
req.logout(err => {
if (err) return next(err)
req.session?.destroy(() => res.clearCookie('connect.sid').json({ ok: true }))
})
})


export default router