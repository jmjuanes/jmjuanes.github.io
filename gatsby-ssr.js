const React = require("react");

//Called after every page Gatsby server renders while building HTML
//https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/#onRenderBody
exports.onRenderBody = actions => {
    actions.setHtmlAttributes({
        lang: "en",
    });

    actions.setHeadComponents([
        <meta charSet="utf-8" />,
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />,
        <meta name="title" content="Josemi Juanes, Ph.D." />,
        <meta name="description" content="Hey! I'm Josemi, a mathematician working, frontend developer and product designer." />,
        <meta property="og:site_name" content="Josemi Juanes, Ph.D." />,
        <meta property="og:title" content="Josemi Juanes, Ph.D." />,
        <meta property="og:type" content="website" />,
        <meta property="og:url" content="https://www.josemi.xyz" />,
        <meta property="og:image" content="https://www.josemi.xyz/og.png" />,
        <meta property="og:description" content="Hey! I'm Josemi, a mathematician, frontend developer and product designer." />,
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800;900&display=swap" />,
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@700;900&display=swap" />,
        <link rel="stylesheet" href={"/low.css"} />,
        <link rel="stylesheet" href={"/resume.css"} />,
        <title>Josemi Juanes, Ph.D.</title>,
    ]);

    actions.setBodyAttributes({
        className: "font-inter bg-white text-gray-700 lh-normal",
    });
};
