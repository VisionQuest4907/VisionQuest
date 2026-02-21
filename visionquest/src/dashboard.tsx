import './dashboard.css';
import {useNavigate} from 'react-router-dom';
import type {MouseEvent, useState} from 'react';
import ModOne from "./assets/moduleone.png";
import ModTwo from "./assets/moduletwo.png";
import ModThree from "./assets/modulethree.png";

function Dashboard() {
    const goTo = useNavigate();
    //test function to get to dashboard until security funcs
    function toSetting(e: MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/setting");
    }
    function toCertView(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/certview");
    }
    function toDash(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/dashboard");
    }
    function toDownload(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/download");
    }
    function toModOne(e:MouseEvent<HTMLImageElement>){
        e.preventDefault();
        goTo("/moduleone/expectations");
    }
    function toModTwo(e:MouseEvent<HTMLImageElement>){
        e.preventDefault();
        goTo("/moduletwo/expectations");
    }
    function toModThree(e:MouseEvent<HTMLImageElement>){
        e.preventDefault();
        goTo("/modulethree/expectations");
    }
    function toAbout(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/");
    }
    return  (
        <div className="dash-pg">
            <nav className="dash-nav">
                <a href="/dashboard" onClick={toDash}>Dashboard</a>
                <a href="/download" onClick={toDownload}>Downloadables</a>
                <a href="/certview" onClick={toCertView}>Certificates</a>
                <div className="dropbutton">
                    <a href="#">Profile</a>
                    <div className="dropmenu">
                        <a href="/settings" onClick={toSetting}>Settings</a>
                        <a href="/" onClick={toAbout}>Logout</a>
                    </div>
                </div>
            </nav>
            <div className="modtabs">
                <img src={ModOne} className="mod-pic" onClick={toModOne}></img>
                <img src={ModTwo} className="mod-pic" onClick={toModTwo}></img>
                <img src={ModThree} className="mod-pic" onClick={toModThree}></img>
            </div>
        </div>
    
    );
}

export default Dashboard;