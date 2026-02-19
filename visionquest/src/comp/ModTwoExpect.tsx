import "./expectpage.css";
import {useNavigate} from 'react-router-dom';
import type {MouseEvent} from 'react';
import introModTwo from './assets/ModuleOneSyllabus.pdf';

function ExpectModTwo(){
    const goTo = useNavigate();
    function toDash(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/dashboard");
    }
    function nextPage(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/moduletwo/video-one");
    }
    return(
        <nav className="expect-pg">
            <nav className="expect-nav">
                <a href="/dashboard" onClick={toDash}>Pause</a>
            </nav>
            <h1>Module Two Expectations</h1>
            <div className="mod-one">
                <iframe src={introModTwo} title="PDF"></iframe>
            </div>
            <button className="mod-one-button">
                    <a href="/moduletwo/video-one" onClick={nextPage}>Next</a>
                </button>
         </nav>
    );
}

export default ExpectModTwo;