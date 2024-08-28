import * as fs from "node:fs";
import * as path from "node:path";
import mikel from "mikel";

// globals
const input = path.join(process.cwd(), "pages");
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

// get pages from input folder
const getPages = () => {
    return fs.readdirSync(input, "utf8")
        .filter(file => path.extname(file) === ".html")
        .map(file => path.join(input, file))
        .map(file => {
            const content = mikel.frontmatter(fs.readFileSync(file, "utf8"));
            return {
                name: path.basename(file, ".html"),
                url: path.join("/", path.basename(file)),
                data: content.data,
                content: content.body,
            };
        });
};

// get data
const getData = () => {
    const dataFolder = path.join(process.cwd(), "data");
    const dataEntries = fs.readdirSync(dataFolder, "utf8")
        .filter(file => path.extname(file) === ".yaml")
        .map(file => path.join(dataFolder, file))
        .map(file => {
            return [path.basename(file, ".yaml"), mikel.yaml(fs.readFileSync(file, "utf8"))];
        });
    return Object.fromEntries(dataEntries);
};

// global data object
const globalData = {
    site: {
        title: "Josemi Juanes, Ph.D.",
        description: "React developer and Minimal Design lover.",
        url: "https://www.josemi.xyz",
        navbar: {
            links: [
                {text: "about", href: "/"},
                {text: "projects", href: "/projects"},
                {text: "writtings", href: "/writtings"},
                // {text: "resume", href: "/resume"},
            ],
        },
        footer: {
            text: "Made with love by Josemi.",
            links: [
                {text: "GitHub", href: "https://github.com/jmjuanes"},
            ],
        },
        buildInfo: getBuildInfo(),
    },
    page: null,
    pages: getPages(),
    posts: [],
    data: getData(),
};

// build pages
globalData.pages.forEach(page => {
    console.log(`[build] save ${page.url}`);
    globalData.page = page; // set current page in global data object
    globalData.page.content = mikel(page.content, globalData); // compile page content
    const content = mikel(template, globalData); // compile template
    fs.writeFileSync(path.join(output, page.url), content, "utf8");
});
