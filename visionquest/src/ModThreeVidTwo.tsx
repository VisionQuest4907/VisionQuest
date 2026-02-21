import {useNavigate} from 'react-router-dom';
import type {MouseEvent} from 'react';
import './VideoOne.css';

function VideoTwoModThree(){
    const goTo = useNavigate();
    function toDash(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/dashboard");
    }
    function nextPage(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/modulethree/video-three");
    }
    function goBack(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/modulethree/video-one");
    }
    return(
        <nav className="vidone-pg">
            <nav className="vidone-nav">
                <a href="/dashboard" onClick={toDash}>Pause</a>
            </nav>
            <h1>Types Of Social Engineering</h1>
            <div className="mod-one">
                <iframe src="https://www.youtube.com/embed/v7VTJhkJUUY" title="Intro Social Engineering" allow="accelerometer; autoplay; picture-in-picture;" allowFullScreen></iframe>
            </div>
            <button className="mod-one-button">
                <a href="/modulethree/video-one" onClick={goBack}>Back</a>
            </button>
            <button className="mod-one-button">
                <a href="/moduleone/video-two" onClick={nextPage}>Next</a>
            </button>
         </nav>
    );
}

export default VideoTwoModThree;