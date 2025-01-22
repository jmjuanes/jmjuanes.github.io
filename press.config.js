import * as path from "node:path";
import * as plugins from "./.press/plugins.js";

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

export default {
    title: "Josemi Juanes, Ph.D.",
    description: "React developer and Minimal Design lover.",
    url: "https://www.josemi.xyz",
    navbar: {
        links: [
            {text: "projects", url: "/projects.html"},
            {text: "notes", url: "/notes.html"},
        ],
    },
    footer: {
        text: "Hand-crafted with care by <b>Josemi</b>.",
        links: [
            {text: "resume", url: "https://resume.josemi.xyz"},
            {text: "github", url: "https://github.com/jmjuanes"},
            {text: "linkedin", url: "https://www.linkedin.com/in/jmjuanes"},
        ],
    },
    build: getBuildInfo(),
    plugins: [
        plugins.SourcePlugin({
            source: "./pages",
            label: "pages",
        }),
        plugins.SourcePlugin({
            source: "./posts",
            label: "posts",
        }),
        plugins.DataPlugin(),
        plugins.FrontmatterPlugin(),
        plugins.MarkdownPlugin(),
        plugins.PermalinkPlugin(),
        plugins.TemplatePlugin({
            template: "./layout.html",
            functions: {
                icon: args => {
                    return `<svg width="1em" height="1em"><use xlink:href="sprite.svg#${args.opt.icon}"></use></svg>`;
                },
            },
        }),
        plugins.CopyAssetsPlugin({
            patterns: [
                {from: path.resolve("node_modules/lowcss/low.css"), to: "low.css"},
                {from: path.resolve("node_modules/@josemi-icons/svg/sprite.svg"), to: "sprite.svg"},
            ],
        }),
    ],
};
