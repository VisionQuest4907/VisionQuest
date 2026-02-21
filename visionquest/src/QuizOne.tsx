import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import type {MouseEvent, FormEvent} from 'react';
import './QuizOne.css';

type Question = {text: string; options: string[]; correctIndex: number;};
const questions: Question[] =[
    {
        text: "For HIPAA violations, what is the range of fines?",
        options: ["$10,000-$100,000", "$75,000-$350,000","$50,000-$250,000", "$25,000-$150,000"],
        correctIndex: 2,
    },
    {
        text: "What is not the purpose of GDPR?",
        options: ["Says what companies can do with user data.", "Prevents data from being collected fully.","Gives users more control how their data is collected and used", "Makes companies justify what they do with user data."],
        correctIndex:1,
    },
    {
        text: "What does HIPAA protect?",
        options: ["Health Records", "Phone Numbers", "Account Numbers", "All of the Above"],
        correctIndex:3,
    }, 
    {
        text: "Violators of HIPAA can get prison time from 1-10 years depending on how much data was compromised.",
        options: ["True","False"],
        correctIndex:0,
    },
    {
        text: "What is the reason for PCI DSS?", 
        options: ["Protect user purchase history.","Protect card data in transactions.", "Make users only use credit cards.", "None of the above."],
        correctIndex:1,
    },
];

const PASS_SCORE = 0.7;
const MAX_ATT = 2;

function QuizOne() {
    const goTo = useNavigate();
    function toDash(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/dashboard");
    }
    function nextPage(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/moduleone/module-one-cert");
    }
    function goBack(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/moduleone/game");
    }
    
    const [useranswer, setuserAnswer] = useState<(number | null)[]>(Array(questions.length).fill(null));
    const [numattempt, setnumAttempt] = useState(0);
    const [currscore, setcurrScore] = useState<number | null>(null);
    const [mess, setMess] = useState("");

    useEffect(() => {
        setuserAnswer(Array(questions.length).fill(null));
        setnumAttempt(0);
        setcurrScore(null);
        setMess("");
    }, []);
    function handleChange(questIndex: number, optIndex: number){
        setuserAnswer(prev => {
            const copy = [...prev];
            copy[questIndex] = optIndex;
            return copy;
        });
    }
    function ScoreSubmit(e: FormEvent<HTMLFormElement>){
        e.preventDefault();
        let corrCount = 0;
        useranswer.forEach((ans, i) => {
            if(ans !== null && ans === questions[i].correctIndex){
                corrCount = corrCount + 1;
            }
        });
        const updateScore = corrCount/questions.length;
        setcurrScore(updateScore);
        const grade = Math.round(updateScore * 100);

        const newAttempt = numattempt+1;
        setnumAttempt(newAttempt);

        if(updateScore >= PASS_SCORE){
            setMess(`Yay you passed! You scored a ${grade}.`);
        } else if (newAttempt >= MAX_ATT) {
            setMess(`Oh no your score wasn't high enough and you ran out of attempts. Sending back to the beginning.`);
            setTimeout(() => goTo("/moduleone/expectations"), 800);
        } else {
            setMess(`That sucks your score of ${grade} wasn't high enough. The goal is 70. Try again.`);
        }
    }
    const answeredAll =  useranswer.every(a => a !== null);
    return(
        <nav className="quiz-pg">
            <nav className="quiz-nav">
                <a href="/dashboard" onClick={toDash}>Pause</a>
            </nav>
            <h1>Data Privacy Quiz</h1>
            {currscore === null &&(
            <p>Get a 70% or above to earn your certificate.</p>
            )}
            {currscore !== null && (
                <div className="results">
                    <p><strong>{mess}</strong></p>
                    <p>Attempt #{numattempt} of 2</p>
                </div>
            )}
            <form className="quiz-official" onSubmit={ScoreSubmit}>
                {questions.map((q, questIndex) => (
                    <div key={questIndex} className="quest-sect">
                        <h2>{q.text}</h2>
                        <div className="opts">
                            {q.options.map((opt, optIndex) => (
                                <label key={optIndex} className="ops-row">
                                    <input type="radio" name={`question-${questIndex}`} value={optIndex} checked={useranswer[questIndex] === optIndex} onChange={() => handleChange(questIndex, optIndex)}></input>
                                    <span>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                <button type="submit" className="quizsubmit" disabled={!answeredAll}>Submit</button>
            </form>
            <button className="mod-one-button">
                <a href="/moduleone/expectations" onClick={goBack}>Back</a>
            </button>
            {currscore !== null && currscore >= .7 && (
            <button className="mod-one-button">
                <a href="/moduleone/module-one-cert" onClick={nextPage}>Next</a>
            </button>
            )}
         </nav>
    );
}

export default QuizOne;