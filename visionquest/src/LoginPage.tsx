import './LoginPage.css';
import {useNavigate} from 'react-router-dom';
import type {FormEvent, MouseEvent} from 'react';

function LoginPage() {
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
  function toRegister(e:MouseEvent<HTMLAnchorElement>){
    e.preventDefault();
    goTo("/registration");
  }
  return  (
    <div className="login-pg">
      <div className="loginDeets">
        <h1>LOGIN</h1>
          <form onSubmit={toDashTest}>
            <label htmlFor="uname">Username</label><br></br>
            <input type="text" id="uname" name="uname"></input><br></br>
            <label htmlFor="pwd">Password</label><br></br>
            <input type="password" id="pwd" name="pwd"></input><br></br>
            <input className="submitButton" type="submit" value="Login"></input>
          </form>
          <h3>Not registered?</h3>
        <div className="other">
          <button className="back-button">
            <a href="/" onClick={toLanding}>Back</a>
          </button>
          <button className="sign-up-button">
            <a href="/" onClick={toRegister}>Register</a>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
