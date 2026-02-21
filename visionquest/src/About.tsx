import './About.css';
import {useNavigate} from 'react-router-dom';
import type {MouseEvent} from 'react';
import about1 from "./assets/about2.png";
import about2 from "./assets/about1.png";

function About(){
    const goTo = useNavigate();
    function toLogin(e: MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/loginpage");
    }
    return (
        <div className="about-pg">
            <div className="about-nav">
                <a href="/loginpage" onClick={toLogin}>Login</a>
            </div>
            <div className="box1">
                <div className="title">
                    <h1>VisionQuest</h1>
                    <p>Where Security Training Is Possible</p>
                </div>
            </div>
            <div className="picOne">
                <img src={about1} alt="Group Meeting"></img>
            </div>
            <div className="box2">
                <div className="textbox2">
                    <h3>Welcome To VisionQuest!</h3>
                    <p>An organization dedicated to training employees to be safe online. From complying with policies to learning to avoid potential malicious behavior, we have it all. 
                       Use VisionQuest to certify your staff today!
                    </p>
                </div>
                <div className="textSide1">
                    <h3>List of Topics</h3>
                    <ul>
                        <li>Data Privacy</li>
                        <li>HIPPA Policies</li>
                        <li>Password Safety</li>
                        <li>Phishing</li>
                    </ul>
                </div>
            </div>
            <div className="box3">
                <div className="textbox3">
                    <h3>What Makes Us Different?</h3>
                    <p>Employee training has always been boring. The same old videos, quizzes, over and over again. It is nothing new and does nothing to help employees truly learn online safety.</p>
                    <p>VisionQuest is the answer. A training platform with games to help with memorization and understanding the material. VisionQuest purpose is to gamify information and make learning interesting to teach users.</p>
                </div>
            </div>
            <div className="box4">
                <div className="textbox4">
                    <h3>Meet Ryan the Raccoon</h3>
                    <p>Our friendly mascot Ryan the Raccoon will be through the user journey to their certification goals.</p>
                </div>
            </div>
            <div className="box5">
                <div className="picTwo">
                    <img src={about2} alt="Computer Office"></img>
                </div>
                <div className="textbox5">
                    <h3>Disclaimer</h3>
                    <p>This is a capstone not an actual product. We are not accredited by anyone.</p>
                </div>
            </div>
            <div className="bottomScreen">
                <h3>VisionQuest</h3>
                <p>Capstone 2025-2026</p>
                <a href="/loginpage" onClick={toLogin}>Login</a>
            </div>
        </div>  
    );
}


export default About;