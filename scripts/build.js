import * as fs from "node:fs";
import * as path from "node:path";
import * as marked from "marked";
import fm from "front-matter";
import mikel from "mikel";

// globals
const output = path.join(process.cwd(), "www");
const template = fs.readFileSync(path.join(process.cwd(), "template.html"), "utf8");

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

// read /data folder
const getData = folder => {
    const files = fs.readdirSync(folder, "utf8")
        .filter(file => path.extname(file) === ".json")
        .map(file => path.join(folder, file))
        .map(file => {
            return [path.basename(file, ".json"), JSON.parse(fs.readFileSync(file, "utf8"))];
        });
    return Object.fromEntries(files);
};

// get pages from input folder
const getPages = (folder, type, parseContent) => {
    return fs.readdirSync(folder, "utf8")
        .filter(file => path.extname(file) === type)
        .map(file => path.join(folder, file))
        .map(file => {
            const content = fm(fs.readFileSync(file, "utf8"));
            return {
                name: path.basename(file, type),
                url: path.join("/", path.basename(file, type) + ".html"),
                data: content.attributes,
                content: parseContent(content.body),
            };
        });
};

// read a partial file
const readPartial = (folder = "partials", file) => {
    return fs.readFileSync(path.join(process.cwd(), folder, file + ".html"), "utf8");
};

// global data object
const globalData = {
    site: {
        title: "Josemi Juanes, Ph.D.",
        description: "React developer and Minimal Design lover.",
        url: "https://www.josemi.xyz",
        navbar: {
            links: [
                {text: "Notes", url: "/notes"},
                {text: "Resume", href: "https://resume.josemi.xyz"},
            ],
        },
        footer: {
            text: "Hand-crafted with care by <b>Josemi</b>.",
            links: [
                {text: "GitHub", url: "https://github.com/jmjuanes"},
            ],
        },
        build: getBuildInfo(),
    },
    data: getData(path.join(process.cwd(), "data")),
    pages: getPages(path.join(process.cwd(), "pages"), ".html", c => c),
    posts: getPages(path.join(process.cwd(), "notes"), ".md", marked.parse),
    page: null,
};

// build stuff
[...globalData.pages, ...globalData.posts].forEach(page => {
    console.log(`[build] save ${page.url}`);
    globalData.page = page; // set current page in global data object
    const content = mikel(template, globalData, {
        functions: {
            icon: args => {
                return `<svg width="1em" height="1em"><use xlink:href="sprite.svg#${args.opt.icon}"></use></svg>`;
            },
        },
        partials: {
            content: page.content,
            layout: readPartial("layouts", page.data.layout || "default"),
            postLink: readPartial("partials", "post-link"),
            pageHeader: readPartial("partials", "page-header"),
        },
    });
    fs.writeFileSync(path.join(output, page.url), content, "utf8");
});
