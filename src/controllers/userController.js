export const join = (req, res) => res.send('<h1>Join</h1>')
export const edit = (req, res) => res.send('<h1>Edit User</h1>')
export const remove = (req, res) => res.send('<h1>Remove User</h1>')
export const login = (req, res) => res.send('<h1>Login</h1>')
export const see = (req, res) => {
  return res.send(`<h1>See User</h1> ${JSON.stringify(req.params)}`)
}

export const logout = (req, res) => res.send('<h1>Log Out</h1>')
