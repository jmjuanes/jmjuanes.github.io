const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
// const package = require("./package.json");

// Write custom webpack configuration
exports.onCreateWebpackConfig = ({plugins, actions}) => {
    return actions.setWebpackConfig({
        devtool: false,
        plugins: [
            // plugins.define({
            //     "process.env.HOMEPAGE": JSON.stringify(package.homepage),
            // }),
            new CopyPlugin({
                patterns: [
                    path.join(__dirname, "node_modules", "lowcss", "dist", "low.css"),
                ],
            }),
        ],
    });
};
