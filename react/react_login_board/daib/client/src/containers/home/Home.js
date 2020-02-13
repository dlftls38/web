import React from 'react';
import { connect } from 'react-redux';
import { getStatusRequest, logoutRequest } from '../../actions/account/authentication';
import history from '../../history';
import { Link } from 'react-router-dom'
import '../../stylesheets/home/Home.css';

const $ = window.$;
const Materialize = window.Materialize;

class Home extends React.Component {

    constructor(props) {
        super(props);
        this.handleLogout = this.handleLogout.bind(this);
    }

    handleLogout() {
        this.props.logoutRequest().then(
            () => {
                 Materialize.toast('Good Bye!', 2000);

                 // EMPTIES THE SESSION
                let loginData = {
                    isLoggedIn: false,
                    username: ''
                };

                document.cookie = 'key=' + btoa(JSON.stringify(loginData));
                this.goBackToLogin();
            }
        );
    }

    goBackToLogin(){
        history.push('/');
    }
    componentDidMount() {
        if (!localStorage.getItem("userInfo")) {
            console.log(1);
            this.goBackToLogin();
            return;
        }

        if(!document.cookie){
            console.log(0);
            this.goBackToLogin();
            return;
        }


        // get cookie by name
        function getCookie(name) {
            var value = "; " + document.cookie;
            var parts = value.split("; " + name + "=");
            var ans = parts.pop().split(";").shift();
            // console.log("value ", value ,"value");
            // console.log("parts ", parts ,"parts");
            // console.log("return ", ans ,"return");
            //if(part)
            return ans;
        }

        // get login data from cookie
        let loginData = getCookie('key');
        // console.log("cookie ", document.cookie ,"cookie");
        // console.log("loginData ", loginData ,"loginData");

        let localstor = JSON.parse(localStorage.getItem("userInfo"));
        // console.log("localstor ", loginData ,"localstor");
        // console.log("localstor.username ", localstor.username ,"localstor.username");
        // console.log("btoa(JSON.stringify(localstor)) ", btoa(JSON.stringify(localstor)) ,"btoa(JSON.stringify(localstor))");
        // console.log("비교 ", loginData === btoa(JSON.stringify(localstor)) ,"비교");

        if(loginData === btoa(JSON.stringify(localstor))){
            // console.log(2);
            //return;
        }
        // if loginData is undefined, do nothing

        if(typeof loginData === "undefined"){
            // console.log(3);
            this.goBackToLogin();
            return;
        }

        // decode base64 & parse json
        loginData = JSON.parse(atob(loginData));

        // if not logged in, do nothing
        if(!loginData.isLoggedIn){
            // console.log(4);
            this.goBackToLogin();
            return;
        }
        // console.log(5);
        // page refreshed & has a session in cookie,
        // check whether this cookie is valid or not
        this.props.getStatusRequest().then(
            () => {
                if(!this.props.status.valid) {
                    // console.log(6);
                    // if session is not valid
                    // logout the session
                    loginData = {
                        isLoggedIn: false,
                        username: ''
                    };

                    document.cookie = 'key=' + btoa(JSON.stringify(loginData));
                    // and notify
                    let $toastContent = $('<span style="color: #FFB4BA">Your session is expired, please log in again</span>');
                    Materialize.toast($toastContent, 4000);
                    this.goBackToLogin();
                }
            }
        );

    }

    render(){
        const loginButton = (
            <li>
                <Link to="/"><i className="material-icons">vpn_key</i></Link>
            </li>
        );

        const logoutButton = (
            <li>
                <a onClick={this.handleLogout}><i className="material-icons">lock_open</i></a>
            </li>
        );

        return (
            <div >
                <nav className="board">
                    <div className="nav-wrapper darken-1 logo">

                        <div className='brand-logo center'>DAIB</div>

                        <div className="right lock">
                            <ul>
                                { this.props.status.isLoggedIn ? logoutButton : loginButton }
                            </ul>
                        </div>
                    </div>
                </nav>
                <div className="menu">
                    <Link to={'/home/main'} className ="menu-item">Main</Link>
                    <Link to={'/home/memo'} className ="menu-item">Memo</Link>
                    <Link to={'/home/post'} className ="menu-item">Post</Link>
                </div>
            </div>
        );

    }
}

const mapStateToProps = (state) => {
    return {
        status: state.authentication.status
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getStatusRequest: () => {
            return dispatch(getStatusRequest());
        },
        logoutRequest: () => {
            return dispatch(logoutRequest());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
