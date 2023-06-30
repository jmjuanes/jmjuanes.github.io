const fs = require("node:fs/promises");
const path = require("node:path");
const React = require("react");
const {renderToStaticMarkup} = require("react-dom/server");

// Import data
const icons = require("./icons.json");
const data = require("./data.json");

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

const Icon = props => (
    <svg xmlns="http-//www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <path d={icons[props.icon]} fill="none" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const PrimaryButton = props => (
    <a href={props.to} className="flex items-center justify-center gap-2 rounded-md px-6 py-4 text-white bg-gray-800 hover:bg-gray-600 no-underline">
        {props.icon && (
            <div className="flex items-center text-2xl">
                <Icon icon={props.icon} />
            </div>
        )}
        <div className="font-bold text-lg">{props.text}</div>
    </a>
);

const Page = props => (
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
            <link rel="stylesheet" href={"./low.css"} />
            <link rel="stylesheet" href={"./resume.css"} />
            <title>Josemi Juanes, Ph.D.</title>
        </head>
        <body className="bg-white m-0 p-0 font-inter text-gray-800 leading-normal">
            {/* Main content */}
            <div className="w-full maxw-7xl mx-auto px-6">
                <div className="flex flex-col py-32">
                    <div className="text-6xl md:text-7xl text-gray-800 font-black leading-tight">
                        <span>Hi! I'm Josemi.</span>
                    </div>
                    <div className="w-full maxw-4xl mt-4 text-2xl text-gray-700">
                        <span>I am a passionate <b>mathematician</b> turned <b>React</b> developer. I combine my mathematical background with my love for design to craft beautiful and performant user interfaces.</span>
                    </div>
                    <div className="mt-10 md:flex">
                        <PrimaryButton text="Resume" icon="file" to="https://resume.josemi.xyz" />
                    </div>
                </div>
                <div className="sm:py-24 py-16">
                    <div className="font-black text-4xl sm:text-6xl text-gray-800 mb-8 sm:mb-12 leading-tight">
                        <span>Projects</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {props.data.projects.map(project => (
                            <div key={project.title} className="flex flex-col p-10 bg-gray-100 rounded-xl">
                                <a href={project.url} target="_blank" className="no-underline hover:underline text-gray-800">
                                    <div className="font-bold text-gray-800 text-3xl leading-none">
                                        <span>{project.title}</span>
                                    </div>
                                </a>
                                <div className="mt-4">{project.description}</div>
                                {project.keywords.length > 0 && (
                                    <div className="mt-6 flex gap-2 flex-wrap">
                                        {project.keywords.map(key => (
                                            <div key={key} className="rounded-full px-3 py-1 bg-gray-300 text-xs text-gray-800">
                                                <span>{key}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Contact and footer section */}
            <div className="w-full maxw-7xl mx-auto px-6 pt-24 pb-32">
                <div className="font-black text-4xl sm:text-6xl mb-6 leading-tight">
                    <a href={`mailto:${props.data.email}`} className="no-underline hover:underline text-gray-800 hover:text-gray-700">
                        <span>{props.data.email}</span>
                    </a>
                </div>
                <div className="w-full maxw-3xl leading-relaxed text-lg mb-8">
                    Thank you for visiting my online profile! 
                    I look forward to the opportunity to contribute my skills and expertise to your next project.
                </div>
                <div className="flex gap-4 items-center mb-20">
                    {props.data.social.map(item => (
                        <a key={item.url} href={item.url} target="_blank" className="no-underline o-100 hover:o-70">
                            <img className="w-8 h-8" src={item.image} />
                        </a>
                    ))}
                </div>
                <div className="text-sm">
                    <div className="mb-2">Hand-crafted with care and love by <b>Josemi</b>.</div>
                    <div>Last built on {props.buildInfo.time.formatted}.</div>
                </div>
            </div>
        </body>
    </html>
);

const main = () => {
    const buildInfo = getBuildInfo();
    return Promise.resolve(true)
        .then(() => {
            const pageContent = React.createElement(Page, {
                data: data,
                buildInfo: buildInfo,
            });
            return renderToStaticMarkup(pageContent);
        })
        .then(content => fs.writeFile(path.join(process.cwd(), "public", "index.html"), content, "utf8"))
        .then(() => {
            console.log("Build finished.");
        });
};

main();
