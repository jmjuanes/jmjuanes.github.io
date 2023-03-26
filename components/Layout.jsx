import React from "react";
import {HeartIcon} from "@mochicons/react";
import {Link} from "gatsby";

const HeaderButton = props => (
    <Link to={props.href} className="d:flex items:center gap:1 cursor:pointer text:no-underline text:gray-800">
        <div className="d:flex items:center text:sm">
            <strong>{props.text}</strong>
        </div>
    </Link>
);

export const Layout = props => (
    <div className="maxw:screen-xl mx:auto px:8">
        <div className="d:grid cols:2 py:4">
            <div className="d:flex items:center select:none">
                <strong>josemi.xyz</strong>
            </div>
            <div className="d:flex items:center justify:end gap:4">
                <HeaderButton
                    href="https://github.com/jmjuanes"
                    text="GitHub"
                />
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
