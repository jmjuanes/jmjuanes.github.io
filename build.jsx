const fs = require("node:fs/promises");
const path = require("node:path");
const React = require("react");
const {renderToStaticMarkup} = require("react-dom/server");
const runtime = require("react/jsx-runtime");
const matter = require("gray-matter")
const {renderIcon} = require("@josemi-icons/react/cjs");

// Generate build info
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
    return {
        time: {
            formatted: new Intl.DateTimeFormat("en-US", dateTimeOptions).format(now),
        },
    };
};

// Fetch imports before running build script
const fetchImports = () => {
    return Promise.all([
        import("@mdx-js/mdx"),
    ]);
};

const PageWrapper = props => (
    <html lang="en">
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no" />
            <meta name="title" content="Josemi Juanes, Ph.D." />
            <meta name="description" content="Hey! I'm Josemi, a mathematician working, frontend developer and product designer." />
            <meta property="og:site_name" content="Josemi Juanes, Ph.D." />
            <meta property="og:title" content="Josemi Juanes, Ph.D." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://www.josemi.xyz" />
            <meta property="og:image" content="https://www.josemi.xyz/og.png" />
            <meta property="og:description" content="Hey! I'm Josemi, a mathematician, frontend developer and product designer." />
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap" />
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@700;900&display=swap" />
            <link rel="stylesheet" href={"./low.css"} />
            <link rel="stylesheet" href={"./resume.css"} />
            <title>{`Josemi Juanes, Ph.D.`}</title>
        </head>
        <body className="bg-white m-0 p-0 font-inter text-gray-900 leading-normal">
            {props.pageContent}
        </body>
    </html>
);

fetchImports().then(imports => {
    const [mdx] = imports;
    const buildInfo = getBuildInfo();
    const inputFolder = path.join(process.cwd(), "pages");
    const outputFolder = path.join(process.cwd(), "www");
    fs.readdir(inputFolder)
        .then(files => files.filter(file => path.extname(file) === ".mdx"))
        .then(files => {
            return Promise.all(files.map(file => {
                const filePath = path.join(inputFolder, file);
                return fs.readFile(filePath, "utf8").then(fileContent => ({
                    ...matter(fileContent),
                    fileName: path.basename(file, ".mdx") + ".html",
                }));
            }));
        })
        .then(pages => {
            return Promise.all(pages.map(page => {
                return mdx.evaluate(page.content, {...runtime})
                    .then(pageComponent => {
                        const pageContent = React.createElement(PageWrapper, {
                            pageContent: React.createElement(pageComponent.default, {
                                page: page,
                                components: {
                                    Fragment: React.Fragment,
                                    Icon: props => renderIcon(props.icon),
                                },
                                build: buildInfo,
                            }),
                            page: page,
                            // pages: pages,
                        });
                        return renderToStaticMarkup(pageContent);
                    })
                    .then(content => fs.writeFile(path.join(outputFolder, page.fileName), content, "utf8"))
                    .then(() => console.log(`Saved file 'www/${page.fileName}'.`));
            }));
        })
        .then(() => console.log("Build finished."));
});
