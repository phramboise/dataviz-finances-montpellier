module.exports = function (api) {
  api.cache(true);

  const presets = [
    "@babel/preset-env",
    "@babel/preset-react"
  ];
  const plugins = [
    "@babel/plugin-proposal-object-rest-spread",
    [
      "inline-svg",
      {
        "svgo": {
          "plugins": [
            {
              "removeDoctype": true
            }
          ]
        }
      }
    ],
    [
      "transform-inline-environment-variables",
      {
        "include": [
          "BASE_URL",
          "NODE_ENV"
        ]
      }
    ]
  ];

  return {
    presets,
    plugins
  };
}
