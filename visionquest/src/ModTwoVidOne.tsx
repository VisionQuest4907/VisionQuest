import {useNavigate} from 'react-router-dom';
import type {MouseEvent} from 'react';
import './VideoOne.css';

function VideoOneModTwo(){
    const goTo = useNavigate();
    function toDash(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/dashboard");
    }
    function nextPage(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/moduletwo/video-two");
    }
    function goBack(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/moduletwo/expectations");
    }
    return(
        <nav className="vidone-pg">
            <nav className="vidone-nav">
                <a href="/dashboard" onClick={toDash}>Pause</a>
            </nav>
            <h1>Why Are Passwords Important?</h1>
            <div className="mod-one">
                <iframe src="https://www.youtube.com/embed/YitHISP0Isk" title="Intro Passwords" allow="accelerometer; autoplay; picture-in-picture;" allowFullScreen></iframe>
            </div>
            <button className="mod-one-button">
                <a href="/moduletwo/expectations" onClick={goBack}>Back</a>
            </button>
            <button className="mod-one-button">
                <a href="/moduleone/video-two" onClick={nextPage}>Next</a>
            </button>
         </nav>
    );
}

export default VideoOneModTwo;