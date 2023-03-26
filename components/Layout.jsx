import React from "react";
import {HeartIcon} from "@mochicons/react";
import {Link as GatsbyLink} from "gatsby";

const Link = props => (
    <GatsbyLink to={props.to} className="d:flex items:center cursor:pointer text:no-underline text:gray-800">
        <strong>{props.text}</strong>
    </GatsbyLink>
);

export const Layout = props => (
    <div className="maxw:screen-xl mx:auto px:8">
        <div className="d:flex justify:between items:center py:10">
            <div className="d:flex items:center select:none">
                <Link to="/" text="josemi.xyz" />
            </div>
            <div className="d:flex items:center justify:end gap:4">
                <Link to="/about" text="About" />
                <Link to="https://github.com/jmjuanes" text="GitHub" />
            </div>
        </div>
        {props.children}
        <div className="py:16 d:flex justify:between items:center">
            <div className="text:sm">
                Made with <HeartIcon /> by <strong>Josemi Juanes</strong>.
            </div>
        </div>
    </div>
);
