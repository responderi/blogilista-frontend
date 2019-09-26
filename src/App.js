import React, { useState, useEffect } from 'react'
import loginService from './services/login'
import blogService from './services/blogs'
import Blog from './components/Blog'
import Notification from './components/Notification'

const App = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => {
    blogService
      .getAll()
      .then(initialBlogs => setBlogs(initialBlogs))
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if(loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username, password
      })

      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    document.location.reload()
  }

  const loginForm = () => (
    <div>
      <form onSubmit={handleLogin}>
       <div>
         username
          <input 
          type="text"
          value={username}
          name="username"
          onChange={({ target }) => setUsername(target.value)}
          />
       </div>
       <div>
         password
          <input
          type="password"
          value={password}
          name="password"
          onChange={({ target }) => setPassword(target.value)}
          />
       </div>
       <button type="submit">login</button>
      </form>
    </div>
  )

  const blogForm = () => (
    <form onSubmit={addBlog}>
      <div>
        title:
        <input value={title} onChange={({ target }) => setTitle(target.value)}/>
      </div>
      <div>
        author:
        <input value={author} onChange={({ target }) => setAuthor(target.value)}/>
      </div>
      <div>
        url:
      <input value={url} onChange={({ target }) => setUrl(target.value)}/>
      </div>
      <button type="submit">create</button>
    </form>
  )

  const addBlog = (event) => {
    event.preventDefault()
    const blogObject = {
      title: title,
      author: author,
      url: url,
      id: blogs.length + 1
    }

    blogService
      .create(blogObject)
      .then(blog => {
        setBlogs(blogs.concat(blog))
        setErrorMessage(`a new blog ${title} by ${author}`)
        setTitle('')
        setAuthor('')
        setUrl('')
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      })
  }

  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification message={errorMessage}/>
        {loginForm()}
      </div>
    )
  }

  return (
    <div>
      <div>
        <h2>blogs</h2>
        <p>{user.name} logged in <button onClick={() => handleLogout()}>logout</button></p>
      </div>
      <div>
        <h2>create new</h2>
        <Notification message={errorMessage}/>
        {blogForm()}
        {blogs.map(blog =>
          <Blog key={blog.id} blog={blog} />
        )}
      </div>
    </div>
  )
}

export default App;
