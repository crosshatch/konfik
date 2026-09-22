Our Effect layer naming convention is:

- When a module’s primary layer represents its core service, export it simply as
  `layer`.
- Only include the service or role in the name when the module exports multiple
  layers and layer alone would not identify what each one provides.
- Add implementation or backend qualifiers after the service or role.
- When a layer is constructed from a particular input source, append
  From<InputSource>.

```
// Module's core service
layer
layerFromConfig
layerFromEnv

// Multiple services or roles in one module
layerFoo
layerFooFromConfig
layerFooFromEnv

layerStoreRedis
layerStoreRedisFromConfig
```

The general forms are:

```
layer[FromInputSource]
layer<ServiceOrRole>[Implementation][FromInputSource]
```

Avoid XLive, XLayer, layerFooConfig, and layerFooEnv.
