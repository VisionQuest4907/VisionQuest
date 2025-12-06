import './LoginPage.css';
import {useNavigate} from 'react-router-dom';
import type {FormEvent} from 'react';

function LoginPage() {
  const goTo = useNavigate();
  //test function to get to dashboard until security funcs
  function toDashTest(e: FormEvent<HTMLFormElement>){
    e.preventDefault();
    goTo("/dashboard");
  }
  return  (
    <div className="login-pg">
      <h1>LOGIN</h1>
      <div>
        <form onSubmit={toDashTest}>
	        <label htmlFor="uname">Username</label><br></br>
	        <input type="text" id="uname" name="uname"></input><br></br>
	        <label htmlFor="pwd">Password</label><br></br>
	        <input type="password" id="pwd" name="pwd"></input><br></br>
          <input type="submit" value="Submit"></input>
        </form>
      </div>
      <div className="other">
          
      </div>
    </div>
  );
}

export default LoginPage;
