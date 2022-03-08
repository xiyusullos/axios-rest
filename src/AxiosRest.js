import axios from 'axios'

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
    this._resourcePath = '/' + trim(resourcePath, '/')
    this.rest = rest
    this.parentResource = parentResource

    if (this.rest.useTailSlash) {
      this._resourcePath += '/'
    }
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
      subresourcePath = resource
      rest = this.rest
    } else {
      throw Error('Not support type: ' + type)
    }

    const resourcePath = `${this.resourcePath}${subresourcePath}`
    return new Resource(resourcePath, rest, this)
  }

  get resourcePath () {
    return this._resourcePath
  }

  create (data, axiosRequestConfig = {}) {
    const method = POST
    const url = this.resourcePath

    return this._copy()._prepare({ method, url, data, ...axiosRequestConfig })
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

export default axiosRest
