import {useNavigate} from 'react-router-dom';
import type {MouseEvent} from 'react';
import './VideoOne.css';

function VideoThree(){
    const goTo = useNavigate();
    function toDash(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/dashboard");
    }
    function nextPage(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/moduleone/video-four");
    }
    function goBack(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/moduleone/video-two");
    }
    return(
        <nav className="vidone-pg">
            <nav className="vidone-nav">
                <a href="/dashboard" onClick={toDash}>Pause</a>
            </nav>
            <h1>GDPR A Summary</h1>
            <div className="mod-one">
                <iframe src="https://www.youtube.com/embed/j6wwBqfSk-o" title="Intro To Data Privacy Video" allow="accelerometer; autoplay; picture-in-picture;" allowFullScreen></iframe>
            </div>
            <button className="mod-one-button">
                <a href="/moduleone/expectations" onClick={goBack}>Back</a>
            </button>
            <button className="mod-one-button">
                <a href="/moduleone/video-two" onClick={nextPage}>Next</a>
            </button>
         </nav>
    );
}

export default VideoThree;