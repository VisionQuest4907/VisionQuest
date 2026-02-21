import './Setting.css'
import {useNavigate} from 'react-router-dom';
import type {MouseEvent, FormEvent} from 'react';

function Setting() {
    const goTo = useNavigate();
    //test function to get to dashboard until security funcs
    function toSetting(e: MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/setting");
    }
    function toCertView(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/certview");
    }
    function toDash(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/dashboard");
    }
    function toDownload(e:MouseEvent<HTMLAnchorElement>){
        e.preventDefault();
        goTo("/download");
    }
    function submitChange(e: FormEvent<HTMLFormElement>){
        e.preventDefault();
    }
    return(
        <div className="setting-pg">
            <nav className="setting-nav">
                <a href="/dashboard" onClick={toDash}>Dashboard</a>
                <a href="/download" onClick={toDownload}>Downloadables</a>
                <a href="/certview" onClick={toCertView}>Certificates</a>
                <a href="/settings" onClick={toSetting}>Settings</a>
                <a href="#">Profile</a>
            </nav>
            <h1>Settings</h1>
            <div className="change-info">
                <h2>Change Information</h2>
                <form className="setting-change-form" onSubmit={submitChange}>
                    <div className="group">
                        <label htmlFor="newFirst">First Name</label>
                        <input type="text" id="newFirst" name="newFirst"></input>
                    </div>
                    <div className="group">
                        <label htmlFor="newLast">Last Name</label>
                        <input type="text" id="newLast" name="newLast"></input>
                    </div>
                    <div className="group">
                        <label htmlFor="newEmail">Email</label>
                        <input type="text" id="newEmail" name="newEmail"></input>
                    </div>
                    <div className="group">
                        <label htmlFor="newPhoneNumber">Phone Number</label>
                        <input type="text" id="newPhoneNumber" name="newPhoneNumber"></input>
                    </div>
                    <div className="group">
                        <label htmlFor="newPassword">Password</label>
                        <input type="password" id="newPassword" name="newPassword"></input>
                    </div>
                    <button type="submit" className="submitChanges">Submit</button>
                </form>
            </div>
            
        </div>
    );
}

export default Setting;