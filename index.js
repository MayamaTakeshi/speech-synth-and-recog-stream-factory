const create_factory = (config) => {
  const ss_engines = Object.keys(config.ss_engines).map(key => {
    var engine = config.ss_engines[key]
    return {...engine, name: key, type: 'synth'}
  })

  const sr_engines = Object.keys(config.sr_engines).map(key => {
    var engine = config.sr_engines[key]
    return {...engine, name: key, type: 'recog'}
  })

  const engines = [...ss_engines, ...sr_engines]
  //console.log("engines", engines)
 
  const promises = engines.map(engine => {
    return new Promise((resolve, reject) => {
      console.log("handling", engine.name)
      import(engine.module)
      .then(m => {
        console.log("resolving", engine.name)
        resolve({
          ...engine,
          m,
        })
      })
      .catch(e => {
        console.log("rejecting", engine.name)
        reject(e)
      })
    })
  })

  return new Promise((resolve, reject) => {
    Promise.all(promises)
    .then(res => {
      const engines = {}
      res.forEach(engine => {
        engines[engine.name] = engine
      })

      const stream_factory = (uuid, engine_name, type, format) => {
        console.log("factory p1 engine_name", engine_name)
        const engine = engines[engine_name]
        if(!engine) return null
        console.log("factory p2")
        const params = {}
        console.log("engine", engine)
        const stream = new engine.m.default(uuid, format, params, engine.config)
        return stream
      }

      resolve(stream_factory)
    })
  })
}

module.exports = create_factory
