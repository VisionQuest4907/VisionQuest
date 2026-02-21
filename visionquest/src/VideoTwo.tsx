import {useNavigate} from 'react-router-dom';
import type {MouseEvent} from 'react';
import './VideoTwo.css';

function VideoTwo(){
    const goTo = useNavigate();
    function toDash(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/dashboard");
    }
    function nextPage(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/moduleone/video-three");
    }
    function goBack(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/moduleone/video-one");
    }
    return(
        <nav className="videotwo-pg">
            <nav className="videotwo-nav">
                <a href="/dashboard" onClick={toDash}>Pause</a>
            </nav>
            <h1>HIPAA What Is It?</h1>
            <div className="mod-one">
                <iframe src="https://www.youtube.com/embed/sNry7tMXlJw" title="HIPPA Video" allow="accelerometer; autoplay; picture-in-picture;" allowFullScreen></iframe>
            </div>
            <button className="mod-one-button">
                <a href="/moduleone/video-one" onClick={goBack}>Back</a>
            </button>
            <button className="mod-one-button">
                <a href="/moduleone/video-three" onClick={nextPage}>Next</a>
            </button>
         </nav>
    );
}

export default VideoTwo;