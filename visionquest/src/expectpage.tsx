import "./expectpage.css";
import {useNavigate} from 'react-router-dom';
import type {MouseEvent} from 'react';
import introModOne from './assets/ModuleOneSyllabus.pdf';

function ExpectModOne(){
    const goTo = useNavigate();
    function toDash(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/dashboard");
    }
    function nextPage(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/moduleone/video-one");
    }
    return(
        <nav className="expect-pg">
            <nav className="expect-nav">
                <a href="/dashboard" onClick={toDash}>Pause</a>
            </nav>
            <h1>Module One Expectations</h1>
            <div className="mod-one">
                <iframe src={introModOne} title="PDF"></iframe>
            </div>
            <button className="mod-one-button">
                    <a href="/moduleone/video-one" onClick={nextPage}>Next</a>
                </button>
         </nav>
    );
}

export default ExpectModOne;