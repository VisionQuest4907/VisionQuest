import './CertView.css';
import {useNavigate} from 'react-router-dom';
import type {MouseEvent} from 'react';
import firstcert from './assets/firstmodcert.png';

function CertView() {
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
        <div className="cert-pg">
            <nav className="cert-nav">
                <a href="/dashboard" onClick={toDash}>Dashboard</a>
                <a href="/download" onClick={toDownload}>Downloadables</a>
                <a href="/certview" onClick={toCertView}>Certificates</a>
                <a href="/settings" onClick={toSetting}>Settings</a>
                <a href="#">Profile</a>
            </nav>
            <h1>Certificate Viewer</h1>
            <div className="cert-firstmod">  
                <img src={firstcert} alt="First Module Certificate"></img>
                <button className="firstcert-download">
                    <a href={firstcert} download="firstmodcert.png">Download Module 1 Certification</a>
                </button>
            </div>
        </div>
        /*
        Comment
        */
    );
}

export default CertView;
