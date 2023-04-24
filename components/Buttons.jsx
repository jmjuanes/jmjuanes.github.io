import React from "react";

export const PrimaryButton = props => (
    <a href={props.to} className="d-flex items-center justify-center gap-2 r-md px-6 py-4 text-white bg-gray-800 bg-gray-600:hover text-no-underline">
        {props.icon && (
            <div className="d-flex items-center text-xl">
                {props.icon}
            </div>
        )}
        <div className="font-bold">{props.text}</div>
    </a>
);

PrimaryButton.defaultProps = {
    to: "",
    icon: null,
};
