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
    .then(engines => {
      const stream_factory = (uuid, engine_name, type, format, params, config) => {
        const engine = engines[key]
        if(!engine) return null

        return new engine.m(uuid, format, params, config)
      }

      resolve(stream_factory)
    })
  })
}

module.exports = create_factory
