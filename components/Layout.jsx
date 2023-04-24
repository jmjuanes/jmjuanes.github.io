import React from "react";
import {HeartIcon} from "@mochicons/react";
import {Link as GatsbyLink} from "gatsby";

const Link = props => (
    <GatsbyLink to={props.to} target={props.target} className="d-flex items-center cursor-pointer text-no-underline text-gray-700">
        {props.text || props.children}
    </GatsbyLink>
);

export const Layout = props => (
    <div className="maxw-screen-xl mx-auto px-8">
        <div className="d-flex justify-between items-center py-10">
            <div className="d-flex items-center select-none">
                <Link to="/">
                    <span className="font-crimson font-black text-gray-800 text-2xl">josemi.</span>
                </Link>
            </div>
            <div className="d-flex items-center justify-end gap-4">
                <Link to="#projects" text="Projects" />
                <Link to="https://github.com/jmjuanes" target="_blank" text="GitHub" />
            </div>
        </div>
        {props.children}
        {/*
        <div className="py:16 d:flex justify:between items:center">
            <div className="text:sm">
                Made with <HeartIcon /> by <strong>Josemi Juanes</strong>.
            </div>
        </div>
        */}
    </div>
);
