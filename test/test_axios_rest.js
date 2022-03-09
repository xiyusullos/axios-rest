const axiosRest = require('../dist/index').default
// import axiosRest from '../src/index'


function testAxiosRest () {
  const handleOk = (r) => console.info(r)
  const handleError = (e) => console.debug(e.toString())

  let baseUrl = 'https://httpbin.org'
  const axiosRequestConfig = {}
  let Rest
  // create Rest with axios interceptors and debug
  Rest = axiosRest(baseUrl, axiosRequestConfig, false, true)
  Rest.axiosInstance.interceptors.response.use(handleOk, handleError)
  // Here, create Rest without interceptors and debug normally
  // Rest = axiosRest(baseUrl)

  // use a common name to be the alias of the resource variable name
  let _

  // define the resource with a '/'
  let Users = Rest('/users')

  const newUser = { username: 'root', password: 'root' }

  _ = Users
  console.info(`\nTest: ${_.resourcePath}`)
  _.create(newUser).response//.then(handleOk).catch(handleError)
  _.list({page: 1, page_size: 10}).response
  _.detail(1).response
  _.update(10, newUser).response
  _.partial_update(11, newUser).response
  _.delete(12).response

  _.login = _.make_plural_action('login')
  _.login(newUser).response

  _.disable = _.make_single_action('disable')
  _.disable(13).response

  _.log = _.make_single_action('log', 'GET')
  _.log(14).response

  // define the response without a '/'
  let Blogs = Rest('blogs')
  _ = Blogs
  console.info(`\nTest: ${_.resourcePath}`)
  _.create(newUser).response//.then(handleOk).catch(handleError)
  _.list({page: 1, page_size: 10}).response
  _.detail(1).response
  _.update(10, newUser).response
  _.partial_update(11, newUser).response
  _.delete(12).response

  // combine two resources, the parameter of `of` is an instance of Resource
  let User10Blogs = Users.detail(10).of(Blogs)
  _ = User10Blogs
  console.info(`\nTest: ${_.resourcePath}`)
  _.create(newUser).response//.then(handleOk).catch(handleError)
  _.list({page: 1, page_size: 10}).response
  _.detail(1).response
  _.update(10, newUser).response
  _.partial_update(11, newUser).response
  _.delete(12).response

  // combine two resources, the parameter of `of` is an instance of Resource
  let User10Articles = Users.detail(10).of('articles')
  _ = User10Articles
  console.info(`\nTest: ${_.resourcePath}`)
  _.create(newUser).response//.then(handleOk).catch(handleError)
  _.list({page: 1, page_size: 10}).response
  _.detail(1).response
  _.update(10, newUser).response
  _.partial_update(11, newUser).response
  _.delete(12).response

}

testAxiosRest()

