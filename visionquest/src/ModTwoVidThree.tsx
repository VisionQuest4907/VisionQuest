import {useNavigate} from 'react-router-dom';
import type {MouseEvent} from 'react';
import './VideoOne.css';

function VideoThreeModTwo(){
    const goTo = useNavigate();
    function toDash(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/dashboard");
    }
    function nextPage(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/moduletwo/game-one");
    }
    function goBack(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/moduletwo/video-one");
    }
    return(
        <nav className="vidone-pg">
            <nav className="vidone-nav">
                <a href="/dashboard" onClick={toDash}>Pause</a>
            </nav>
            <h1>Hackers and Passwords</h1>
            <div className="mod-one">
                <iframe src="https://www.youtube.com/embed/vKPGZHoHX8k?si=IwaIt0RQ-fCcrHvs" title="Password Etiquette" allow="accelerometer; autoplay; picture-in-picture;" allowFullScreen></iframe>
            </div>
            <button className="mod-one-button">
                <a href="/moduletwo/game-one" onClick={goBack}>Back</a>
            </button>
            <button className="mod-one-button">
                <a href="/moduletwo/quiz" onClick={nextPage}>Next</a>
            </button>
         </nav>
    );
}

export default VideoThreeModTwo;