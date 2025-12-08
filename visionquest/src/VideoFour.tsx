import {useNavigate} from 'react-router-dom';
import type {MouseEvent} from 'react';
import './VideoOne.css';

function VideoFour(){
    const goTo = useNavigate();
    function toDash(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/dashboard");
    }
    function nextPage(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/moduleone/game");
    }
    function goBack(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/moduleone/video-three");
    }
    
    return(
        <nav className="vidone-pg">
            <nav className="vidone-nav">
                <a href="/dashboard" onClick={toDash}>Pause</a>
            </nav>
            <h1>PCI-DSS In A Video</h1>
            <div className="mod-one">
                <iframe src="https://www.youtube.com/embed/IAkJRzj6MAQ" title="Intro To Data Privacy Video" allow="accelerometer; autoplay; picture-in-picture;" allowFullScreen></iframe>
            </div>
            <button className="mod-one-button">
                <a href="/moduleone/video-three" onClick={goBack}>Back</a>
            </button>
            <button className="mod-one-button">
                <a href="/moduleone/game" onClick={nextPage}>Next</a>
            </button>
         </nav>
    );
}

export default VideoFour;