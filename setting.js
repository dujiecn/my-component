var mode = process.argv[process.argv.length - 1];


var settings = {
  __DEV__: false,
  "process.env": {
    NODE_ENV: JSON.stringify("production")
  },
  WDS_URL: "http://localhost:3000",
  BASE_URL: JSON.stringify("http://123.57.226.128:8080/bbly")
};

if (mode == "dev") {
  Object.assign(settings, {
    __DEV__: true,
    BASE_URL: JSON.stringify("http://localhost:8080")
  });
}

console.info('设置默认参数：' + JSON.stringify(settings));
module.exports = settings;
