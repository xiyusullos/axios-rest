// import axios from 'axios'
const axios = require('axios')

const [GET, POST, PUT, PATCH, DELETE] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

function trim (string, character) {
  const start = [...string].findIndex(char => char !== character)
  const last = [...string].reverse().findIndex(char => char !== character)
  return string.substring(start, string.length - last)
}

function trimStart (string, character) {
  const start = [...string].findIndex(char => char !== character)
  return string.substr(start)
}

function trimEnd (string, character) {
  const last = [...string].reverse().findIndex(char => char !== character)
  return string.substring(0, string.length - last)
}

function standardizePath (path) {
  return '/' + trim(path, '/')
}

const axiosRest = (baseURL, axiosRequestConfig = {}, useTailSlash = false, isDebug = false) => {
  this.axiosInstance = axios.create({
    baseURL,
    ...axiosRequestConfig,
  })
  this.useTailSlash = useTailSlash
  this.isDebug = isDebug

  const f = (resourcePath) => new Resource(resourcePath, this, null)
  f.axiosInstance = this.axiosInstance
  return f
}

class Resource {
  constructor (resourcePath, rest, parentResource = null) {
    this._resourcePath = standardizePath(resourcePath)
    this.rest = rest
    this.parentResource = parentResource
  }

  _copy () {
    return new Resource(this.resourcePath, this.rest, this.parentResource)
  }

  _prepare (axiosRequestConfig) {
    this.axiosRequestConfig = axiosRequestConfig
    return this
  }

  of (resource) {
    const type = typeof resource
    let subresourcePath, rest
    if (type === 'object') {
      subresourcePath = resource.resourcePath
      rest = resource.rest
    } else if (type === 'string') {
      subresourcePath = standardizePath(resource)
      rest = this.rest
    } else {
      throw Error('Not support type: ' + type)
    }

    const resourcePath = `${this.axiosRequestConfig.url}${subresourcePath}`
    return new Resource(resourcePath, rest, this)
  }

  get resourcePath () {
    return this._resourcePath
  }

  create (data, axiosRequestConfig = {}) {
    const method = POST
    let url = this.resourcePath
    if (this.rest.useTailSlash) {
      url += '/'
    }

    return this._copy()._prepare({ method, url, data, ...axiosRequestConfig })
  }

  list (axiosRequestConfig = {}) {
    const method = GET
    let url = this.resourcePath
    if (this.rest.useTailSlash) {
      url += '/'
    }

    return this._copy()._prepare({ method, url, ...axiosRequestConfig })
  }

  detail (id, axiosRequestConfig = {}) {
    const method = GET
    const url = `${this.resourcePath}/${id}`

    return this._copy()._prepare({ method, url, ...axiosRequestConfig })
  }

  update (id, data = {}, axiosRequestConfig = {}) {
    const method = PUT
    const url = `${this.resourcePath}/${id}`

    return this._copy()._prepare({ method, url, data, ...axiosRequestConfig })
  }

  partial_update (id, data = {}, axiosRequestConfig = {}) {
    const method = PATCH
    const url = `${this.resourcePath}/${id}`

    return this._copy()._prepare({ method, url, data, ...axiosRequestConfig })
  }

  delete (id, axiosRequestConfig = {}) {
    const method = DELETE
    const url = `${this.resourcePath}/${id}`

    return this._copy()._prepare({ method, url, ...axiosRequestConfig })
  }

  make_plural_action (action_name, method = POST) {
    let url = `${this.resourcePath}/${action_name}`
    if (this.rest.useTailSlash) {
      url += '/'
    }

    const action = (data = {}, axiosRequestConfig) => this._copy()._prepare({
      method,
      url,
      data, ...axiosRequestConfig
    })

    return action
  }

  make_single_action (action_name, method = POST) {
    const action = (id, data = {}, axiosRequestConfig) => {
      let url = `${this.resourcePath}/${id}/${action_name}`
      if (this.rest.useTailSlash) {
        url += '/'
      }
      return this._copy()._prepare({ method, url, data, ...axiosRequestConfig })
    }

    return action
  }

  get response () {
    if (this.rest.isDebug) {
      const { method, url, params, data } = this.axiosRequestConfig
      let fullUrl = this.rest.axiosInstance.defaults.baseURL + url
      let queryString = ''
      if (params) {
        queryString = JSON.stringify(params)
      }

      let dataString = ''
      if (data) {
        dataString = JSON.stringify(data)
      }

      console.debug(`${method} ${fullUrl} ${queryString} ${dataString}`)
    }
    const axiosInstance = this.rest.axiosInstance
    return axiosInstance.request(this.axiosRequestConfig)
  }
}

// export default axiosRest

function testAxiosRest () {
  const handleOk = (r) => {console.info(r)}
  const handleError = (e) => {console.debug(e.toString())}

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
  _.list().response
  _.detail(1).response
  _.update(10, newUser).response
  _.partial_update(11, newUser).response
  _.delete(12).response

  _.login = _.make_plural_action('login')
  _.login(newUser).response

  _.disable = _.make_single_action('disable')
  _.disable(13).response

  _.log = _.make_single_action('log', GET)
  _.log(14).response

  // define the response without a '/'
  let Blogs = Rest('blogs')
  _ = Blogs
  console.info(`\nTest: ${_.resourcePath}`)
  _.create(newUser).response//.then(handleOk).catch(handleError)
  _.list().response
  _.detail(1).response
  _.update(10, newUser).response
  _.partial_update(11, newUser).response
  _.delete(12).response

  // combine two resources, the parameter of `of` is an instance of Resource
  let User10Blogs = Users.detail(10).of(Blogs)
  _ = User10Blogs
  console.info(`\nTest: ${_.resourcePath}`)
  _.create(newUser).response//.then(handleOk).catch(handleError)
  _.list().response
  _.detail(1).response
  _.update(10, newUser).response
  _.partial_update(11, newUser).response
  _.delete(12).response

  // combine two resources, the parameter of `of` is an instance of Resource
  let User10Articles = Users.detail(10).of('articles')
  _ = User10Articles
  console.info(`\nTest: ${_.resourcePath}`)
  _.create(newUser).response//.then(handleOk).catch(handleError)
  _.list().response
  _.detail(1).response
  _.update(10, newUser).response
  _.partial_update(11, newUser).response
  _.delete(12).response

}

testAxiosRest()
