import User from '../models/User'
import bcrypt from 'bcrypt'

export const getJoin = (req, res) => res.render('join', { pageTitle: 'Join' })
export const postJoin = async (req, res) => {
  const { name, email, username, password, password2, location } = req.body
  const pageTitle = 'Join'
  if (password !== password2) {
    return res.status(400).render('join', {
      pageTitle,
      errMsg: '🔴Password confirmation does not match ',
    })
  }
  if (await User.exists({ $or: [{ username }, { email }] })) {
    return res.status(400).render('join', {
      pageTitle,
      errMsg: '🔴This username/email is already taken',
    })
  }
  try {
    await User.create({
      name,
      email,
      username,
      password,
      location,
    })
    return res.redirect('/login')
  } catch (error) {
    return res.status(400).redirect('/join', {
      pageTitle,
      errMsg: error._message,
    })
  }
}
export const getLogin = (req, res) =>
  res.render('login', { pageTitle: 'Login' })
export const postLogin = async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({ username })
  const pageTitle = 'Login'
  if (!user) {
    return res.status(400).render('login', {
      pageTitle,
      errMsg: "🔴We don't have such username",
    })
  }
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) {
    return res.status(400).render('login', {
      pageTitle,
      errMsg: '🔴Wrong Password',
    })
  }
  return res.send('Success')
}

export const edit = (req, res) => res.send('<h1>Edit User</h1>')
export const remove = (req, res) => res.send('<h1>Remove User</h1>')
export const see = (req, res) => {
  return res.send(`<h1>See User</h1> ${JSON.stringify(req.params)}`)
}

export const logout = (req, res) => res.send('<h1>Log Out</h1>')
