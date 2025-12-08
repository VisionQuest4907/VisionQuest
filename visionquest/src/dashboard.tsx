import './dashboard.css';
import {useNavigate} from 'react-router-dom';
import type {MouseEvent} from 'react';
import ModOne from "./assets/moduleone.png";

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
    return  (
        <div className="dash-pg">
            <nav className="dash-nav">
                <a href="/dashboard" onClick={toDash}>Dashboard</a>
                <a href="/download" onClick={toDownload}>Downloadables</a>
                <a href="/certview" onClick={toCertView}>Certificates</a>
                <a href="/settings" onClick={toSetting}>Settings</a>
                <a href="#">Profile</a>
            </nav>
            <img src={ModOne} className="mod-pic" onClick={toModOne}></img>

        </div>
    
    );
}

export default Dashboard;
