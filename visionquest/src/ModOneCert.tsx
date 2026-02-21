import './ModOneCert.css';
import {useNavigate} from 'react-router-dom';
import type {MouseEvent} from 'react';
import firstcert from './assets/firstmodcert.png';

function ModOneCert() {
    const goTo = useNavigate();
    function toDash(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/dashboard");
    }
    function nextPage(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/dashboard");
    }
    return(
        <div className="modcert-pg">
            <nav className="modcert-nav">
                <a href="/dashboard" onClick={toDash}>Pause</a>
            </nav>
            <h1>Congrats!</h1>
            <h2>Here Is Your Certificate!</h2>
            <div className="modcert-firstmod">  
                <img src={firstcert} alt="First Module Certificate"></img>
                <button className="modfirstcert-download">
                    <a href={firstcert} download="firstmodcert.png">Download Module 1 Certification</a>
                </button>
            </div>
            <button className="certmod-one-button">
                <a href="/dashboard" onClick={nextPage}>Dashboard</a>
            </button>
        </div>
        
    );
}

export default ModOneCert;