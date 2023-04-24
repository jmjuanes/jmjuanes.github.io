import React from "react";
import {Link} from "gatsby";

export const PackageItem = props => (
    <div className="d-flex flex-col p-10 bg-gray-200 r-xl">
        <div className="font-crimson font-black text-gray-800 text-2xl tracking-tight lh-none">{props.title}</div>
        <div className="mt-2">{props.description}</div>
        <div className="d-flex mt-8">
            <Link to={props.url} target="_blank" className="d-flex items-center text-no-underline r-full bg-gray-800:hover text-gray-800 text-white:hover b-solid b-2 b-gray-800 px-4 py-2">
                <span className="text-sm">Documentation</span>
            </Link>
        </div>
    </div>
);
