# clean-copy
Recursively copy while ignoring certain directories (e.g. node_modules)

# Installing

**npm**
```sh
$ npm i -S clean-copy
```

**yarn**
```sh
$ yarn add clean-copy
```

# Usage

```js
/* filesystem
/root/
|----/a/
     |-/asd.txt
     |-/xyz/
     | |---/fgh.txt
     |-/node_modules/
       |------------/etc/
*/

import copy from 'clean-copy'

copy('root/a', 'root/b', path => !/^node_modules$/.test(path))

/* filesystem
/root/
|----/a/
|    |-/asd.txt
|    |-/xyz/
|    | |---/fgh.txt
|    |-/node_modules/
|      |------------/etc/
|----/b/
     |-/asd.txt
     |-/xyz/
       |---/fgh.txt
*/

```

# API

**`copy : (from : String, to : String, [filter : Regex | String -> Boolean = () => true]) -> Promise Error Any`**
Recursively copies files and directories from `from` to `to`, where only candidate paths for which `filter` returns `true` are copied. If `filter` is a `Regex`, `filter.test` will be used as the predicate. If the operation is successful, the Promise will resolve.

`copy` checks to see if `to` is or will be a child of `from`, and will throw an error if so. This prevents a directory from recursively specifying itself as a candidate path.
