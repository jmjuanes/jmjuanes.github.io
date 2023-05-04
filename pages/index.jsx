import React from "react";
import {FileIcon} from "@mochicons/react";

import {PrimaryButton} from "../components/Buttons.jsx";
import {Layout} from "../components/Layout.jsx";
import {AppItem} from "../components/AppItem.jsx";
import {PackageItem} from "../components/PackageItem.jsx";

import appsData from "../data/apps.js";
import packagesData from "../data/packages.js";

export default () => (
    <Layout>
        <div className="d-flex flex-col py-28">
            <div className="text-4xl text-6xl@md text-gray-800 font-black font-crimson tracking-tight">
                Hi! I'm Josemi.
            </div>
            <div className="w-full maxw-xl mt-4 text-lg text-gray-700">
                Mathematician, <b>React.js</b> developer and Product designer. Currently based on Valencia, Spain.
            </div>
            <div className="mt-10 d-flex@md">
                <PrimaryButton to="/resume" text="Resume" icon={(<FileIcon />)} />
            </div>
        </div>
        <div className="pt-24 pb-20">
            <div className="font-crimson font-black text-4xl text-gray-800 mb-16 tracking-tight text-center text-underline">
                <a href="index.html#projects" name="projects" className="text-gray-800">Projects</a>
            </div>
            <div className="">
                {appsData.map(appProps => (
                    <AppItem key={appProps.title} {...appProps} />
                ))}
            </div>
            <div className="d-grid cols-1 cols-3@md gap-6 mt-16">
                {packagesData.map(packageProps => (
                    <PackageItem key={packageProps.title} {...packageProps} />
                ))}
            </div>
        </div>
    </Layout>
);
