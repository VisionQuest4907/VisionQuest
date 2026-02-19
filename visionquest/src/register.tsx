import './register.css';
import {useNavigate} from 'react-router-dom';
import type {FormEvent, MouseEvent} from 'react';

function RegistrationPage() {
  const goTo = useNavigate();
  //test function to get to dashboard until security funcs
  function toDashTest(e: FormEvent<HTMLFormElement>){
    e.preventDefault();
    goTo("/dashboard");
  }
  function toLanding(e:MouseEvent<HTMLAnchorElement>){
    e.preventDefault();
    goTo("/");
  }
  return  (
    <div className="reg-pg">
      <div className="regDeets">
        <h1>Registration</h1>
          <form onSubmit={toDashTest}>
            <label htmlFor="uname">Username</label><br></br>
            <input type="text" id="uname" name="uname"></input><br></br>
            <label htmlFor="uemail">Email</label><br></br>
            <input type="text" id="uemail" name="uemail"></input><br></br>
            <label htmlFor="pwd">Password</label><br></br>
            <input type="password" id="pwd" name="pwd"></input><br></br>
            <input className="submitButton" type="submit" value="Confirm"></input>
          </form>
        <div className="other">
          <button className="back-button">
            <a href="/" onClick={toLanding}>Back</a>
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegistrationPage;