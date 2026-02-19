import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import type {MouseEvent} from 'react';
import './ModOneGame.css';

function ModTwoGameOne(){
    const goTo = useNavigate();
    function toDash(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/dashboard");
    }
    function nextPage(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/moduletwo/video-three");
    }
    function goBack(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/moduletwo/video-two");
    }
    const policies = ["HIPPA", "GDPR", "PCI-DSS"];
    const def = ["Protects personal data of EU citizens", "Protects patient health data", "Policy about protecting credit card information"];
    const answers: Record<number, number> = {0:1, 1:0, 2:2};
    const [userright, setuserright] = useState<number | null>(null);
    const [userleft, setuserleft] = useState<number | null>(null);
    const [matchy, setmatchy] = useState<{left: number; right: number}[]>([]);
    const win = false;

    function userchoseRight(i: number){
        setuserright(i);
        if(userleft != null){
            if(answers[userleft] === i){
                setmatchy([...matchy, {left: userleft, right: i}]);
            }
            setuserright(null);
            setuserleft(null);
        }
    }
    function userchoseLeft(i: number) {
        setuserleft(i);
    }

    const corrmatch = (side:"left"|"right", index:number) => matchy.some(m=>m[side] == index);

    return(
        <nav className="game-pg">
            <nav className="game-nav">
                <a href="/dashboard" onClick={toDash}>Pause</a>
            </nav>
            <h1>Match The Definition</h1>
            <div className="gameboard">
                <div className="left-col">
                    {policies.map((word, i) => (
                        <button className={`left-game-button ${userleft === i ? "selected": ""} ${corrmatch("left",i) ? "correct":""}`}
                        onClick={() => !corrmatch("left", i) && userchoseLeft(i)}>{word}</button>
                    ))}
                </div>
                <div className="right-col">
                    {def.map((sum, i) => (
                        <button key={i} className={`right-game-button ${userright === i ? "selected": ""} ${corrmatch("right",i) ? "correct":""}`}
                        onClick={() => !corrmatch("right", i) && userchoseRight(i)}>{sum}</button>
                    ))}
                </div>
            </div>
            {matchy.length === 3 &&
                <p>Congrats You Got Them Right</p>
            }
            <button className="mod-one-button">
                <a href="/moduletwo/video-two" onClick={goBack}>Back</a>
            </button>
            {matchy.length === 3 && (
            <button className="mod-one-button">
                <a href="/moduletwo/video-three" onClick={nextPage}>Next</a>
            </button>
            )}
         </nav>
    );
}

export default ModTwoGameOne;