import './db'
import './models/Video'
import './models/User'
import app from './server'

const PORT = 4000

const handleListen = () =>
  console.log(`🟢 Sever Run http://localhost:${PORT}/ 🌠`)

app.listen(PORT, handleListen)
