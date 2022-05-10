import axios from 'axios'
// const axios = require('axios')

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

const axiosRest = function (baseURL, axiosRequestConfig = {}, useTailSlash = false, isDebug = false) {
  const rest = {
    axiosInstance: axios.create({
      baseURL,
      ...axiosRequestConfig,
    }),
    useTailSlash: useTailSlash,
    isDebug: isDebug,
  }

  const f = (resourcePath) => new Resource(resourcePath, rest, null)
  f.axiosInstance = rest.axiosInstance
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

    const url = this.axiosRequestConfig ? this.axiosRequestConfig.url : this.resourcePath
    const resourcePath = `${url}${subresourcePath}`
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

  list (params = {}, axiosRequestConfig = {}) {
    const method = GET
    let url = this.resourcePath
    if (this.rest.useTailSlash) {
      url += '/'
    }

    return this._copy()._prepare({ method, url, params, ...axiosRequestConfig })
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
    // if (this.rest.useTailSlash) {
    //   url += '/'
    // }

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
      // if (this.rest.useTailSlash) {
      //   url += '/'
      // }
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
        queryString += '?'
        for (const k in params) {
          queryString += [k, params[k]].join('=')
        }
      }

      let dataString = ''
      if (data) {
        dataString = JSON.stringify(data)
      }

      console.debug(`${method} ${fullUrl}${queryString} ${dataString}`)
    }
    const axiosInstance = this.rest.axiosInstance
    return axiosInstance.request(this.axiosRequestConfig)
  }
}

export default axiosRest
