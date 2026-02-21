import {useNavigate} from 'react-router-dom';
import type {MouseEvent} from 'react';
import './VideoOne.css';

function VideoOneModThree(){
    const goTo = useNavigate();
    function toDash(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/dashboard");
    }
    function nextPage(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/modulethree/video-two");
    }
    function goBack(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/modulethree/expectations");
    }
    return(
        <nav className="vidone-pg">
            <nav className="vidone-nav">
                <a href="/dashboard" onClick={toDash}>Pause</a>
            </nav>
            <h1>What Is Social Engineering?</h1>
            <div className="mod-one">
                <iframe src="https://www.youtube.com/embed/PWVN3Rq4gzw" title="Intro Social Engineering" allow="accelerometer; autoplay; picture-in-picture;" allowFullScreen></iframe>
            </div>
            <button className="mod-one-button">
                <a href="/modulethree/expectations" onClick={goBack}>Back</a>
            </button>
            <button className="mod-one-button">
                <a href="/modulethree/video-two" onClick={nextPage}>Next</a>
            </button>
         </nav>
    );
}

export default VideoOneModThree;