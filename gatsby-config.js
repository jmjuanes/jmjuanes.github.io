const path = require("path");
const package = require("./package.json");

module.exports = {
    pathPrefix: "/",
    siteMetadata: {
        title: "Josemi Juanes, Ph.D.",
        description: "Mathematician working as a Frontend developer and Product designer",
        url: "https://www.josemi.xyz/",
    },
    plugins: [
        {
            resolve: "gatsby-source-filesystem",
            options: {
                name: "pages",
                path: path.join(__dirname, "pages"),
            },
        },
        {
            resolve: "gatsby-plugin-page-creator",
            options: {
                path: path.join(__dirname, "pages"),
            },
        },
    ],
};
