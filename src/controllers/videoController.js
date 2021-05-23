const fakeUser = {
  username: 'CloudG',
  logined: true,
}

export const home = (req, res) =>
  res.render('home', { pageTitle: 'Home', fakeUser })
export const see = (req, res) => res.render('watch', { pageTitle: 'Watch' })
export const edit = (req, res) => res.render('edit', { pageTitle: 'Edit' })
export const search = (req, res) => res.send('<h1>Search Video</h1>')
export const remove = (req, res) => res.send('<h1>Remove Video</h1>')
export const upload = (req, res) => res.send('<h1>Upload Video</h1>')
