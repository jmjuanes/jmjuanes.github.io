import React from "react";
import classNames from "classnames";
import {renderIcon} from "@josemi-icons/react";

// @description available form options
export const FORM_OPTIONS = {
    SELECT: "select",
    RADIO: "radio",
    RANGE: "range",
    CHECKBOX: "checkbox",
    TEXT: "text",
    TEXTAREA: "textarea",
    CUSTOM: "custom",
    SEPARATOR: "separator",
    LABELED_SELECT: "labeled-select",
};

// Tiny utility to check if a value is active
export const checkIsActive = (value, currentValue, isActiveFn, data) => {
    if (typeof isActiveFn === "function") {
        return isActiveFn(value, currentValue, data);
    }
    // Other case, just check if value is the current value
    return value === currentValue;
};

// Tiny utility to check if a value is visible
export const checkIsVisible = (value, currentValue, isVisibleFn, data) => {
    if (typeof isVisibleFn === "function") {
        return !!isVisibleFn(value, currentValue, data);
    }
    // By default, item is visible
    return true;
};

const optionsWithInlineTitle = new Set([
    FORM_OPTIONS.CHECKBOX,
    FORM_OPTIONS.PIXELS,
    FORM_OPTIONS.RANGE,
    FORM_OPTIONS.SEPARATOR,
]);

const optionTypes = {
    [FORM_OPTIONS.RADIO]: props => (
        <div className={props.className || "grid grid-cols-5 gap-1 w-full"}>
            {(props.values || []).map(item => {
                if (!checkIsVisible(item.value, props.value, props.isVisible, props.data)) {
                    return null;
                }
                const active = checkIsActive(item.value, props.value, props.isActive, props.data);
                const itemClass = classNames({
                    "flex flex-col justify-center items-center rounded-md py-2 grow": true,
                    "cursor-pointer": !active,
                    "bg-neutral-900 text-white": active,
                    "bg-neutral-100 hover:bg-neutral-200": !active,
                });
                return (
                    <div key={item.value} className={itemClass} onClick={() => props.onChange(item.value)}>
                        {!!item.icon && (
                            <div className={classNames("flex items-center", item.iconClass)}>
                                {renderIcon(item.icon)}
                            </div>
                        )}
                        {!!item.text && (
                            <div className={classNames("flex items-center", item.textClass)}>
                                <span className="font-bold text-xs">{item.text}</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    ),
    [FORM_OPTIONS.RANGE]: props => (
        <div className="flex items-center gap-2">
            {props.title && (
                <div className="text-xs w-16 shrink-0">
                    {props.title}
                </div>
            )}
            <div className="flex items-center">
                <input
                    type="range"
                    className={classNames({
                        "m-0 w-full h-1 mt-3 mb-2": true,
                        "bg-neutral-200": true,
                    })}
                    onChange={e => props.onChange(e.target.value || 0)}
                    defaultValue={props.value}
                    min={props.minValue}
                    max={props.maxValue}
                    step={props.step}
                />
            </div>
        </div>
    ),
    [FORM_OPTIONS.CHECKBOX]: props => {
        const inputClass = classNames({
            "cursor-pointer border rounded-full p-px w-8 flex": true,
            "justify-end": !!props.value,
            "bg-neutral-900 border-neutral-900": !!props.value,
            "bg-neutral-200 border-neutral-200": !props.value,
            "cursor-not-allowed opacity-60": props.disabled,
        });
        const handleClick = () => {
            return !props.disabled && props.onChange(!props.value);
        };
        return (
            <div className="flex items-center justify-between select-none">
                <div className="text-sm font-bold select-none">
                    {props.title}
                </div>
                <div className={inputClass} onClick={handleClick}>
                    <div className="bg-white rounded-full w-4 h-4" />
                </div>
            </div>
        );
    },
    [FORM_OPTIONS.TEXT]: props => (
        <input
            type="text"
            className={classNames({
                "w-full px-2 py-0 h-8 rounded-md outline-0 text-xs": true,
                "bg-white border border-neutral-200 text-neutral-900": true,
            })}
            defaultValue={props.value}
            placeholder={props.placeholder}
            onChange={event => props.onChange(event.target.value)}
        />
    ),
    [FORM_OPTIONS.TEXTAREA]: props => (
        <textarea
            className={classNames({
                "w-full px-2 py-1 rounded-md outline-0 text-xs": true,
                "bg-white border border-neutral-200 text-neutral-900": true,
            })}
            defaultValue={props.value}
            placeholder={props.placeholder}
            rows={props.rows ?? 3}
            onChange={event => props.onChange(event.target.value)}
        />
    ),
    [FORM_OPTIONS.SELECT]: props => {
        const selectClass = classNames({
            "w-full px-2 py-1 rounded-md outline-0 text-xs": true,
            "bg-neutral-100 border border-neutral-200 text-neutral-900": true,
        });
        return (
            <select className={selectClass} defaultValue={props.value} onChange={e => props.onChange(e.target.value)}>
                {(props.values || []).map(item => {
                    if (!checkIsVisible(item.value, props.value, props.isVisible, props.data)) {
                        return null;
                    }
                    return (
                        <option key={item.value} value={item.value}>
                            {item.text || item.value}
                        </option>
                    );
                })}
            </select>
        );
    },
    [FORM_OPTIONS.CUSTOM]: props => {
        return props.render?.(props);
    },
    [FORM_OPTIONS.SEPARATOR]: () => (
        <div className="w-full h-px shrink-0 bg-current opacity-40" />
    ),
};

export const Option = props => (
    <div className={props.className}>
        {(!optionsWithInlineTitle.has(props.type)) && !!props.title && (
            <div className="text-sm mb-1 select-none font-bold">
                {props.title}
            </div>
        )}
        <div className="block">
            {optionTypes[props.type](props)}
        </div>
        {!!props.helper && (
            <div className="text-2xs mt-0 select-none opacity-60">
                {props.helper}
            </div>
        )}
    </div>
);

// TODO: check the visible field of each item to decide if item should be visible
const getVisibleItems = (items, data) => {
    return Object.keys(items || {})
        .filter(key => {
            const item = items[key];
            if (typeof item.test === "function") {
                return !!item.test(data);
            }
            return true;
        });
};

export const Form = props => (
    <div className={props.className || "flex flex-col gap-4"} style={props.style || {}}>
        {getVisibleItems(props.items, props.data).map(key => (
            <React.Fragment key={key}>
                <Option
                    {...props.items[key]}
                    key={key}
                    field={key}
                    value={props.data?.[key] ?? null}
                    data={props.data ?? {}}
                    theme={props.theme}
                    onChange={value => props.onChange?.(key, value)}
                />
                {props.separator && (
                    <div className="last:hidden flex items-center justify-center">
                        {props.separator}
                    </div>
                )}
            </React.Fragment>
        ))}
    </div>
);
