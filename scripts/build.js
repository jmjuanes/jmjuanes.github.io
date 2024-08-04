import * as fs from "node:fs";
import * as path from "node:path";
import mikel from "mikel";

// read a JSON file
const readJsonSync = (jsonPath, encoding = "utf8") => {
    return JSON.parse(fs.readFileSync(jsonPath, encoding));
};

// globals
const input = path.join(process.cwd(), "pages");
const output = path.join(process.cwd(), "www");
const template = fs.readFileSync(path.join(process.cwd(), "template.html"), "utf8");
const pkg = readJsonSync(path.join(process.cwd(), "package.json"));

// get pages from input folder
const getPages = () => {
    return fs.readdirSync(input, "utf8")
        .filter(file => path.extname(file) === ".yaml")
        .map(file => {
            const name = path.basename(file, path.extname(file));
            const content = fs.readFileSync(path.join(input, file), "utf8");
            return {
                name: name,
                url: name + ".html",
                data: mikel.yaml(content),
                content: "",
            };
        });
};

// global data object
const globalData = {
    site: {
        title: pkg.name,
        description: "",
        url: "https://josemi.xyz",
        stylesheets: ["/low.css"],
        navbar: {
            subdomain: "folio",
            links: [
                {text: "home", link: "/"},
                {text: "pricing", link: "/"},
                {text: "releases", link: "/"},
            ],
            actions: [
                {text: "Try it", link: "/"},
            ],
        },
        brand: [
            {text: "josemi", link: "/"},
            {text: "folio", link: "/"},
        ],
        footer: "Made with love by Josemi."
    },
    page: null,
    pages: getPages(),
};

// build pages
globalData.pages.forEach(page => {
    console.log(`[build] save ${page.url}`);
    globalData.page = page; // set current page in global data object
    fs.writeFileSync(path.join(output, page.url), mikel(template, globalData), "utf8");
});
