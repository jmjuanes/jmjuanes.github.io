import React from "react";
import {EnvelopeIcon, GlobeIcon, LocationIcon, BookIcon, CaretRightIcon} from "@mochicons/react";
import {BriefcaseIcon, CodeBlockIcon, ToolsIcon, CodeIcon} from "@mochicons/react";

import data from "../data/resume.js";

const ContactItem = props => (
    <div className="d-flex items-center gap-2">
        <div className="d-flex items-center text-xl">
            {props.icon}
        </div>
        <div className="font-bold">{props.text}</div>
    </div>
);

const ExternalLink = props => (
    <div className="d-flex items-center gap-1">
        {props.icon && (
            <div className="d-flex items-center">
                {props.icon}
            </div>
        )}
        <div className="font-bold text-sm">{props.text}</div>
    </div>
);

const SectionTitle = props => (
    <div className="mb-4">
        <div className="d-flex items-center gap-2 w-full">
            {props.icon && (
                <div className="d-flex items-center text-2xl">
                    {props.icon}
                </div>
            )}
            <div className="font-bold font-crimson tracking-tight text-2xl">{props.title}</div>
        </div>
    </div>
);

const Keywords = props => (
    <div className="d-flex items-center gap-2 flex-wrap">
        {props.items.map(key => (
            <div key={key} className="px-3 py-1 r-full bg-gray-200 text-xs">
                <strong>{key}</strong>
            </div>
        ))}
    </div>
);

const Separator = () => (
    <div className="w-full py-10">
        <div className="w-48 mx-auto bb-dashed bb-3 bb-gray-400" />
    </div>
);

export default () => (
    <React.Fragment>
        <div className="resume-page">
            <div className="mb-8">
                <div className="font-black font-crimson tracking-tight text-4xl mb-2">Jose M. Juanes, Ph.D.</div>
                <div className="mb-4">
                    <div>I am a <b>mathematician</b> and <b>bioinformatician</b> that loves to <b>design</b> and <b>develop</b> web products.</div>
                    <div>My areas of interest are <b>JavaScript</b>, <b>React</b>, <b>Data Visualization</b> and <b>UI/UX Design</b>.</div>
                </div>
                <div className="d-flex flex-wrap w-full gap-4">
                    <ContactItem icon={(<GlobeIcon />)} text={data.contact.website} />
                    <ContactItem icon={(<EnvelopeIcon />)} text={data.contact.mail} />
                    <ContactItem icon={(<LocationIcon />)} text={data.location} />
                </div>
            </div>
            <div className="mb-8">
                <SectionTitle icon={(<BookIcon />)} title="Education" />
                {data.education.map(item => (
                    <div key={item.title} className="d-flex justify-between w-full mb-2">
                        <div className="d-flex items-center gap-2">
                            <div className="font-bold">{item.title}</div>
                            <div className="text-gray-500 text-sm">{item.university}</div>
                        </div>
                        <div className="d-flex items-center gap-1">
                            <div className="font-bold">{item.startDate}</div>
                            <div className="d-flex items-center text-gray-600">
                                <CaretRightIcon />
                            </div>
                            <div className="font-bold">{item.endDate}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mb-0">
                <SectionTitle icon={(<BriefcaseIcon />)} title="Professional Experience" />
                {data.experience.map(item => (
                    <div key={item.title} className="d-flex justify-between gap-4 w-full mb-6">
                        <div className="">
                            <div className="d-flex items-center gap-2">
                                <div className="font-bold">{item.title}</div>
                                <div className="text-sm text-gray-600 font-bold">·</div>
                                <div className="text-sm text-gray-600">{item.company}</div>
                            </div>
                            <div className="text-sm mb-2">{item.description}</div>
                            {item.keywords && (
                                <Keywords items={item.keywords} />
                            )}
                        </div>
                        <div className="d-flex items-center gap-1 flex-shrink-0 justify-end">
                            <div className="font-bold">{item.startDate}</div>
                            <div className="d-flex items-center text-gray-600">
                                <CaretRightIcon />
                            </div>
                            <div className="font-bold">{item.endDate || "Present"}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="resume-separator py-16" />
        <div className="resume-page">
            <div className="mb-8">
                <SectionTitle icon={(<CodeBlockIcon />)} title="Skills" />
                <div className="d-flex items-center gap-2 flex-wrap">
                    {data.skills.map(item => (
                        <div key={item.name} className="px-3 py-1 r-full text-xs bg-gray-200">
                            <strong>{item.name}</strong>
                        </div>
                    ))}
                </div>
            </div>
            <div className="">
                <SectionTitle icon={(<ToolsIcon />)} title="Side Projects" />
                <div className="mb-4">
                    I spend most of my free-time working on <b>Open Source projects</b>, . There are some of my side projects that I am working on.
                </div>
                {data.sideProjects.map(item => (
                    <div key={item.title} className="mb-6">
                        <div className="d-flex items-center gap-4">
                            <div className="font-bold font-crimson tracking-tight text-xl">{item.title}</div>
                            <div className="px-2 py-1 r-full bg-gray-200 text-2xs">
                                <strong>{item.type}</strong>
                            </div>
                        </div>
                        <div className="mb-2">{item.description}</div>
                        <div className="mb-4 d-none">
                            <Keywords items={item.keywords} />
                        </div>
                        <div className="d-flex items-center gap-4 w-full">
                            {item.website && (
                                <ExternalLink icon={(<GlobeIcon />)} text={item.website} />
                            )}
                            {item.repository && (
                                <ExternalLink icon={(<CodeIcon />)} text={item.repository} />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </React.Fragment>
);
