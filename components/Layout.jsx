import React from "react";
import {HeartIcon, ArchiveIcon} from "@mochicons/react";
import {Link} from "gatsby";

const HeaderButton = props => (
    <Link to={props.href} className="d:flex items:center gap:1 cursor:pointer text:no-underline text:light-900 text:white:hover">
        <div className="d:flex items:center text:lg">
            {props.icon}
        </div>
        <div className="d:flex items:center text:sm">
            <strong>{props.text}</strong>
        </div>
    </Link>
);

export const Layout = props => (
    <div className="maxw:screen-lg mx:auto px:8">
        <div className="d:grid cols:2 py:4">
            <div className="d:flex items:center select:none">
                <strong style={{fontFamily: "Nunito"}}>josemi.xyz</strong>
            </div>
            <div className="d:flex items:center justify:end gap:4">
                <HeaderButton
                    href="https://github.com/jmjuanes"
                    icon={(<ArchiveIcon />)}
                    text="GitHub"
                />
            </div>
        </div>
        {props.children}
        <div className="py:24 text:center text:light-900 text:sm">
            Made with <HeartIcon /> by <strong>Josemi Juanes</strong>.
        </div>
    </div>
);
