const axiosRest = require('../dist/AxiosRest').default

// import axiosRest from '../dist/AxiosRest'

function testAxiosRest () {
  const handleOk = (r) => {console.info(r)}
  const handleError = (e) => {console.debug(e.toString())}

  let baseUrl = 'https://httpbin.org'
  const axiosRequestConfig = {}
  let Rest
  Rest = axiosRest(baseUrl, axiosRequestConfig, false, true)
  Rest.axiosInstance.interceptors.response.use(handleOk, handleError)
// Rest = axiosRest(baseUrl)
  let Users = Rest('/users')
  let Blogs = Rest('blogs')

  let UsersBlogs = Users.of(Blogs)

  const newUser = { username: 'root', password: 'root' }

  Users.create(newUser).response//.then(handleOk).catch(handleError)
  Blogs.create(newUser).response//.then(handleOk).catch(handleError)
}
