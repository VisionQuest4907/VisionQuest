import './Setting.css'
import {useNavigate, Link} from 'react-router-dom';
import type {MouseEvent} from 'react';

function Setting() {
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
    return(
        <div className="setting-pg">
            <nav className="setting-nav">
                <a href="/dashboard" onClick={toDash}>Dashboard</a>
                <a href="#">Downloadables</a>
                <a href="/certview" onClick={toCertView}>Certificates</a>
                <a href="/settings" onClick={toSetting}>Settings</a>
                <a href="#">Profile</a>
            </nav>
            <h1>Settings</h1>
        </div>
    );
}

export default Setting;