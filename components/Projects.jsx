import React from "react";
import {Link} from "gatsby";
import {featuredProjects} from "../data/projects.js";

export const Projects = () => (
    <div className="py:20">
        <div className="text:2xl mb:8">
            <strong>Projects</strong>
        </div>
        <div className="d:grid cols:1 cols:2@sm cols:4@lg w:full gap:4">
            {featuredProjects.map(item => (
                <div key={item.name} className="w:full mb:4">
                    <Link to={item.url} className="d:block text:no-underline text:gray-800 mb:2">
                        <strong className="text:uppercase text:lg">{item.name}</strong>
                    </Link>
                    <div className="">
                        {item.description}
                    </div>
                </div>
            ))}
        </div>
    </div>
);
