import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import loginback from './assets/loginback.png'
import './LoginPage.css'

function LoginPage() {
  return  (
    <div>
      <h1>LOGIN</h1>
      <div className="card">
        <form>
	  <label for="uname">Username</label><br></br>
	  <input type="text" id="uname" name="uname"></input><br></br>
	  <label for="pwd">Password</label><br></br>
	  <input type="password" id="pwd" name="pwd"></input><br></br>
          <input type="submit" value="Submit"></input>
	</form>
      </div>
      <div className="other">
          
      </div>
    </div>
  )
}

export default LoginPage
