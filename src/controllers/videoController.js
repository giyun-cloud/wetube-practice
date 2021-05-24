let videos = [
  {
    title: 'First Video',
    rating: 3,
    comments: 3,
    playtime: '60m',
    views: 3,
    id: 1004,
  },
  {
    title: 'Second Video',
    rating: 4,
    comments: 5,
    playtime: '65m',
    views: 1,
    id: 22,
  },
  {
    title: 'Third Video',
    rating: 5,
    comments: 3,
    playtime: '50m',
    views: 77,
    id: 333,
  },
]

export const home = (req, res) =>
  res.render('home', { pageTitle: 'Home', videos })

export const watch = (req, res) => {
  const video = videos.filter(
    (video) => video.id === parseInt(req.params.id),
  )[0]
  return res.render('watch', {
    pageTitle: `Watching ${video.title}`,
    video,
  })
}

export const getEdit = (req, res) => {
  const video = videos.filter(
    (video) => video.id === parseInt(req.params.id),
  )[0]
  return res.render('edit', { pageTitle: `Editing ${video.title}`, video })
}

export const postEdit = (req, res) => {
  const video = videos.filter((video) => {
    return video.id === parseInt(req.params.id)
  })[0]
  videos[videos.indexOf(video)].title = req.body.title
  return res.redirect(`/videos/${video.id}`)
}

export const getUpload = (req, res) => {
  return res.render('upload', { pageTitle: 'Upload Video' })
}
export const postUpload = (req, res) => {
  const { title, playtime } = req.body
  videos[videos.length] = {
    title,
    rating: 0,
    comments: 0,
    playtime: `${playtime}m`,
    views: 1,
    id: videos.length,
  }
  return res.redirect('/')
}
