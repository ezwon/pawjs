import _ from "lodash";

const fs = require('fs');
const path = require('path');


const babelServer = require('./babel-server-rule')({
  cacheDirectory: false,
}).use.options;

require('@babel/register')({
  presets: babelServer.presets.default ? babelServer.presets.default : babelServer.presets,
  plugins: babelServer.plugins,
  cache: false,
  ignore: [
    /node_modules\/(?!(@pawjs)).*/,
  ],
});
const CliHandler = require('../../../scripts/cli').default;

if (!process.env.PROJECT_ROOT) {
  // eslint-disable-next-line
  const cli = new CliHandler();
}
const directories = require('../utils/directories');

const emptyClass = path.resolve(process.env.LIB_ROOT, 'src', 'webpack', 'utils', 'emptyClass.js');
const projectClientPath = `${process.env.PROJECT_ROOT}/src/client.js`;
const projectClientExists = fs.existsSync(projectClientPath);

const projectServerPath = `${process.env.PROJECT_ROOT}/src/server.js`;
const projectServerExists = fs.existsSync(projectServerPath);

const commonResolvers = [
  path.resolve(path.join(directories.root, 'node_modules')),
];


if (fs.existsSync(path.join(process.env.LIB_ROOT, 'node_modules'))) {
  commonResolvers.push(path.join(process.env.LIB_ROOT, 'node_modules'));
}

if (fs.existsSync(path.join(process.env.LIB_ROOT, '..', 'node_modules'))) {
  commonResolvers.push(path.join(process.env.LIB_ROOT, '..', 'node_modules'));
}

if (fs.existsSync(path.join(process.env.LIB_ROOT, '..', '..', 'node_modules'))) {
  commonResolvers.push(path.join(process.env.LIB_ROOT, '..', '..', 'node_modules'));
}

if (fs.existsSync(path.join(process.env.LIB_ROOT, '..', '..', '..', 'node_modules'))) {
  commonResolvers.push(path.join(process.env.LIB_ROOT, '..', '..', '..', 'node_modules'));
}

const loaderResolver = commonResolvers.slice(0);
loaderResolver.push(path.join(process.env.LIB_ROOT, 'src', 'webpack', 'loaders'));

const projectRootPackage = require(`${process.env.PROJECT_ROOT}/package.json`);
const moduleAliases = projectRootPackage.moduleAliases || {};

_.map(Object.keys(moduleAliases),(alias)=>{
   moduleAliases[alias] = `${process.env.PROJECT_ROOT}/${moduleAliases[alias]}`;
});

const resolver = {
  resolve: {
    alias: Object.assign({}, {
        pawjs: path.resolve(path.join(process.env.LIB_ROOT)),
        pawProjectClient: projectClientExists ? projectClientPath : emptyClass,
        pawProjectServer: projectServerExists ? projectServerPath : emptyClass,
    }, moduleAliases),
    modules: commonResolvers,
  },
  resolveLoader: {
    modules: loaderResolver,
  },
};
module.exports = resolver;
