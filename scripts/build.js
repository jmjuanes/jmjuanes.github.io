import press from "mikel-press";
import hljs from "highlight.js";
import {BabelJSXPlugin} from "./plugins.js";
import websiteConfig from "../website.config.json" with {type: "json"};

// generate build info
const getBuildInfo = () => {
    const now = new Date();
    // Use Intl.DateFileFormat to generate build time
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
    const dateTimeOptions = {
        dateStyle: "full",
        timeStyle: "long",
        timeZone: "CET",
    };
    // Return build info
    return new Intl.DateTimeFormat("en-US", dateTimeOptions).format(now);
};

press({
    ...websiteConfig,
    build: getBuildInfo(),
    mikelOptions: {
        helpers: {
            getCollection: params => {
                const items = (params.data?.site?.pages || []).filter(page => {
                    return params.args[0] && page?.attributes?.collection === params.args[0];
                });
                return params.fn(params.data, {collection: items});
            },
        },
        functions: {
            icon: args => {
                return [
                    `<svg width="1em" height="1em">`,
                    `<use xlink:href="/vendor/icons.svg#${args.opt.icon}"></use>`,
                    `</svg>`,
                ].join("");
            },
            highlight: params => {
                return hljs.highlight(params.opt.code.trim(), {language: params.opt.language}).value;
            },
        },
    },
    plugins: [
        press.SourcePlugin({folder: "./posts", basePath: "notes"}),
        press.DataPlugin(),
        press.PartialsPlugin(),
        press.AssetsPlugin({basePath: "assets"}),
        press.FrontmatterPlugin(),
        BabelJSXPlugin(),
        press.ContentPagePlugin(),
    ],
});
