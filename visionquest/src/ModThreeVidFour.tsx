import {useNavigate} from 'react-router-dom';
import type {MouseEvent} from 'react';
import './VideoOne.css';

function VideoFourModThree(){
    const goTo = useNavigate();
    function toDash(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/dashboard");
    }
    function nextPage(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/modulethree/video-four");
    }
    function goBack(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/modulethree/video-three");
    }
    return(
        <nav className="vidone-pg">
            <nav className="vidone-nav">
                <a href="/dashboard" onClick={toDash}>Pause</a>
            </nav>
            <h1>Case Study: Phishing</h1>
            <div className="mod-one">
                <iframe src="https://www.youtube.com/embed/fHhNWAKw0bY" title="Intro Social Engineering" allow="accelerometer; autoplay; picture-in-picture;" allowFullScreen></iframe>
            </div>
            <button className="mod-one-button">
                <a href="/modulethree/video-three" onClick={goBack}>Back</a>
            </button>
            <button className="mod-one-button">
                <a href="/moduleone/video-four" onClick={nextPage}>Next</a>
            </button>
         </nav>
    );
}

export default VideoFourModThree;