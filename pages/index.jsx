import React from "react";
import {Layout} from "../components/Layout.jsx";

export default props => (
    <Layout>
        <div className="py:32">
            <div className="text:xl mb:6">
                <strong>Hi! I'm Josemi &#128075;</strong>
            </div>
            <div className="maxw:screen-sm text:5xl text:dark-100 font:bold lh:tight" style={{fontFamily: "Nunito"}}>
                I'm a <span className="text:white">mathematician</span> working as a <span className="text:white">frontend developer</span> and <span className="text:white">designer</span>.
            </div>
        </div>
        {/*
        <div className="py:24">
            <div className="text:2xl text:light-900">
                <strong>Projects</strong>
            </div>
        </div>
        */}
    </Layout>
);
