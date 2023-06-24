const fs = require("node:fs/promises");
const path = require("node:path");
const React = require("react");
const {renderToStaticMarkup} = require("react-dom/server");
const runtime = require("react/jsx-runtime");
const matter = require("gray-matter");

// Import data
const pkg = require("./package.json");
const icons = require("./icons.json");

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

const readMarkdownFile = (folder, file) => {
    const filePath = path.join(folder, file);
    return fs.readFile(filePath, "utf8").then(fileContent => {
        const {data, content} = matter(fileContent);
        return {
            data: data,
            content: content,
            fileName: path.basename(file, ".mdx") + ".html",
        };
    });
};

// Fetch imports before running build script
const fetchImports = () => {
    return Promise.all([
        import("@mdx-js/mdx"),
    ]);
};

const pageComponents = {
    Icon: props => (
        <svg xmlns="http-//www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
            <path d={icons[props.icon]} fill="none" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Fragment: React.Fragment,
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
            {/* <title>{props.page.data.title}</title> */}
            <title>Josemi Juanes, Ph.D.</title>
        </head>
        <body className="bg-white m-0 p-0 font-inter text-gray-700 leading-normal">
            {props.page.data?.layout === "default" && (
                <React.Fragment>
                    {/* Header content */}
                    <div className="border-b-1 border-gray-300 relative">
                        <div className="w-full maxw-7xl h-20 px-6 mx-auto flex items-center justify-between">
                            <a href="./index.html" className="flex items-center gap-1 text-gray-800 no-underline">
                                <div className="flex items-center h-16">
                                    <img src="avatar.png" className="h-full" />
                                </div>
                                <div className="font-black font-crimson text-2xl tracking-tight">
                                    <span>josemi.</span>
                                </div>
                            </a>
                            <div className="hidden sm:flex gap-6 items-center">
                                {props.pages.filter(p => p.fileName !== "index.html").map(page => (
                                    <a key={page.fileName} href={page.fileName} className="no-underline text-gray-800 hover:text-gray-600">
                                        <span className="font-medium">{page.data.title}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Main content */}
                    <div className="w-full maxw-7xl mx-auto px-6">
                        {props.pageContent}
                    </div>
                    {/* Contact and footer section */}
                    <div className="w-full maxw-7xl mx-auto px-6 pt-24 pb-32">
                        <div className="font-crimson font-black text-4xl sm:text-6xl mb-6 tracking-tight leading-tight">
                            <a href={`mailto:${pkg.author.email}`} className="no-underline text-gray-800 hover:text-gray-600">
                                <span>{pkg.author.email}</span>
                            </a>
                        </div>
                        <div className="w-full maxw-3xl leading-relaxed text-lg mb-8">
                            Thank you for visiting my online profile! 
                            I look forward to the opportunity to contribute my skills and expertise to your next project.
                        </div>
                        <div className="flex gap-4 items-center mb-20">
                            {Object.keys(pkg.social).map(key => (
                                <a key={key} href={pkg.social[key]} target="_blank" className="no-underline o-100 hover:o-70">
                                    <img className="w-8 h-8" src={`./${key}.svg`} />
                                </a>
                            ))}
                        </div>
                        <div className="text-sm">
                            <div className="mb-2">Hand-crafted with care and love by <b>Josemi</b>.</div>
                            <div>Last built on {props.buildInfo.time.formatted}.</div>
                        </div>
                    </div>
                </React.Fragment>
            )}
            {props.page.data?.layout === "empty" && (
                <React.Fragment>
                    {props.pageContent}
                </React.Fragment>
            )}
        </body>
    </html>
);

fetchImports().then(imports => {
    const [mdx] = imports;
    const log = msg => console.log(`[build] ${msg}`);
    const buildInfo = getBuildInfo();
    const inputFolder = path.join(process.cwd(), "pages");
    const outputFolder = path.join(process.cwd(), "public");
    log("Starting build...");
    log("Reading .mdx files from 'pages/' folder.");
    fs.readdir(inputFolder)
        .then(files => files.filter(file => path.extname(file) === ".mdx"))
        .then(files => {
            log(`Processing ${files.length} files.`);
            return Promise.all(files.map(file => {
                return readMarkdownFile(inputFolder, file);
            }));
        })
        .then(pages => {
            return Promise.all(pages.map(page => {
                return mdx.evaluate(page.content, {...runtime})
                    .then(pageComponent => {
                        const pageContent = React.createElement(PageWrapper, {
                            pageContent: React.createElement(pageComponent.default, {
                                page: page,
                                components: pageComponents,
                                data: {
                                    version: pkg.version,
                                    author: pkg.author,
                                    social: pkg.social,
                                },
                            }),
                            page: page,
                            pages: pages,
                            buildInfo: buildInfo,
                        });
                        return renderToStaticMarkup(pageContent);
                    })
                    .then(content => fs.writeFile(path.join(outputFolder, page.fileName), content, "utf8"))
                    .then(() => {
                        log(`Saved file 'public/${page.fileName}'.`);
                    });
            }));
        })
        .then(() => log("Build finished."));
});
