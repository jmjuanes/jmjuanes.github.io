import React from "react";
import {Layout} from "../components/Layout.jsx";
import {Projects} from "../components/Projects.jsx";

export default props => (
    <Layout>
        <div className="py:24">
            <div className="text:xl mb:6">
                <strong>Hi! I'm Josemi &#128075;</strong>
            </div>
            <div className="maxw:screen-md text:3xl text:5xl@md text:gray-600 font:bold lh:tight">
                I'm a <span className="text:gray-800">mathematician</span> working as a <span className="text:gray-800">frontend developer</span> and <span className="text:gray-800">designer</span>.
            </div>
        </div>
        <Projects />
    </Layout>
);
