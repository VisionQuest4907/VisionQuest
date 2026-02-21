import "./Download.css";
import {useNavigate} from 'react-router-dom';
import type {MouseEvent} from 'react';
import introModOne from './assets/ModuleOneSyllabus.pdf';

function Download(){
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
    return(
        <div className="down-pg">
            <nav className="down-nav">
                <a href="/dashboard" onClick={toDash}>Dashboard</a>
                <a href="/download" onClick={toDownload}>Downloadables</a>
                <a href="/certview" onClick={toCertView}>Certificates</a>
                <a href="/settings" onClick={toSetting}>Settings</a>
                <a href="#">Profile</a>
            </nav>
            <h1>Downloads</h1>
            <h2>Module 1</h2>
            <div className="mod-one">
                <iframe src={introModOne} title="PDF"></iframe>
            </div>
        </div>
    );
}

export default Download;