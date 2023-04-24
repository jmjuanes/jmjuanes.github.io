import React from "react";
import {Link} from "gatsby";

export const AppItem = props => (
    <div className="d-flex flex-col p-20 bg-gray-200 r-xl mb-8">
        <div className="pt-12 pb-12">
            <div className="font-crimson font-black text-gray-800 text-6xl tracking-tight lh-none">{props.title}</div>
            <div className="font-crimson font-bold text-gray-800 text-3xl tracking-tight mt-0">{props.subtitle}</div>
            <div className="w-full maxw-lg mt-6 text-lg">{props.description}</div>
            {(props.keywords || []).length > 0 && (
                <div className="d-flex flex-wrap gap-2 w-full maxw-lg mt-2">
                    {props.keywords.map(key => (
                        <div key={key} className="r-full px-3 py-1 text-sm bg-gray-300 text-xs text-gray-800">{key}</div>
                    ))}
                </div>
            )}
            {(props.url || props.sourceUrl) && (
                <div className="d-flex gay-4 mt-8">
                    {props.url && (
                        <Link to={props.url} target="_blank" className="text-no-underline r-full bg-gray-900 bg-gray-700:hover text-white px-4 py-2">
                            <strong>Learn more</strong>
                        </Link>
                    )}
                </div>
            )}
        </div>
    </div>
);
