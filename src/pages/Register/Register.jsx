<<<<<<< HEAD
import React from "react";
import { Link, Redirect } from "react-router-dom";
import axios from "axios";
import "./Register.css";
=======
import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import './Register.css';

>>>>>>> 1734816b213340e8244f30e3e710f3401c3e1a95

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      email: "",
      password: "",
      isAuth: false
    };
    this.clicked = "";
    this.errors = {
      username: [],
      email: [],
      password: [],
      __all__: []
    };
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  handleSubmit = event => {
    this.clicked = "is-loading";
    this.forceUpdate();
    this.register(this.state.username, this.state.email, this.state.password);
    event.preventDefault();
  };

  async register(username, email, password) {
    try {
      const res1 = await axios.post(
        `${process.env.REACT_APP_API_DOMAIN_NAME}/api/register`,
        {
          username,
          email,
          password
        }
      );
      this.clicked = "";
      if (res1.data.token) {
        localStorage.setItem("authToken", res1.data.token);
        this.setState({ isAuth: true });
      } else {
        // console.log('Good request but something is wrong, token was not given');
        toast.error("Error occured!");
        this.errors = {
          username: [],
          email: [],
          password: [],
          __all__: [
            "registeration was successful but your authorization was not, please try to login"
          ]
        };
        // console.log(res1.data);
        this.forceUpdate();
      }
<<<<<<< HEAD
    } catch (e) {
=======
    } catch(e) {
      toast.error("Error occured!");
>>>>>>> 1734816b213340e8244f30e3e710f3401c3e1a95
      this.clicked = "";
      if (e.response) {
        this.errors = {
          username: [],
          email: [],
          password: [],
          __all__: []
        };
        const errors = e.response.data.errors;
        if (errors.username) {
          this.errors.username = errors.username;
        }
        if (errors.email) {
          this.errors.email = errors.email;
        }
        if (errors.password) {
          this.errors.password = errors.password;
        }
        if (errors.__all__) {
          this.errors.__all__ = errors.__all__;
        }
        this.forceUpdate();
        // console.log(this.errors);
      } else {
        this.errors = {
          username: [],
          email: [],
          password: [],
          __all__: [
            "OMG! Server is down. We'll notify the development team right away."
          ]
        };
        this.forceUpdate();
        // console.table(e);
      }
    }
  }

  render() {
<<<<<<< HEAD
    if (this.state.isAuth) {
      return <Redirect to="/home" push={true} />;
=======
    if(this.state.isAuth || localStorage.getItem("authToken")) {
      return <Redirect to="/home" push={true}/>
>>>>>>> 1734816b213340e8244f30e3e710f3401c3e1a95
    }

    return (
      <section className="hero is-light">
        <div className="hero-body">
          <div className="container has-text-centered">
            <div className="column is-4 is-offset-4">
              <h3 className="title has-text-grey">Register</h3>

              <div className="box">
                <form onSubmit={this.handleSubmit} autoComplete="off">
                  <div className="field">
                    <div className="control">
                      <input
                        className="input is-medium"
                        type="text"
                        name="username"
                        placeholder="Username"
                        autoFocus
                        value={this.state.name}
                        onChange={this.handleChange}
                      />
                    </div>

<<<<<<< HEAD
                    <p className="help is-danger">{this.errors.username}</p>
=======
                    <p className="help is-danger is-size-5">
                      {this.errors.username}
                    </p>
>>>>>>> 1734816b213340e8244f30e3e710f3401c3e1a95
                  </div>

                  <div className="field">
                    <div className="control">
                      <input
                        className="input is-medium"
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={this.state.email}
                        onChange={this.handleChange}
                      />
                    </div>
<<<<<<< HEAD
                    <p className="help is-danger">{this.errors.email}</p>
=======
                    <p className="help is-danger is-size-5">
                    {this.errors.email}
                    </p>
>>>>>>> 1734816b213340e8244f30e3e710f3401c3e1a95
                  </div>

                  <div className="field">
                    <div className="control">
                      <input
                        className="input is-medium"
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={this.state.password}
                        onChange={this.handleChange}
                      />
                    </div>
<<<<<<< HEAD
                    <p className="help is-danger">{this.errors.password}</p>
                  </div>
                  <p className="help is-danger">{this.errors.__all__}</p>
                  <button
                    type="submit"
                    className={
                      "button is-fullwidth is-info is-large " + this.clicked
                    }
                    disabled={
                      this.state.username === "" ||
                      this.state.email === "" ||
                      this.state.password === ""
                    }
                  >
                    Create account
                  </button>
=======
                    <p className="help is-danger is-size-5">
                    {this.errors.password}
                    </p>
                  </div>
                  <p className="help is-danger is-size-5">
                  {this.errors.__all__}
                  </p>
                  <button type="submit" className={"button is-fullwidth is-info is-large " + this.clicked}
                  disabled={this.state.username === "" || this.state.email === "" || this.state.password === ""}>Create account</button>
>>>>>>> 1734816b213340e8244f30e3e710f3401c3e1a95
                </form>
              </div>

              <p className="has-text-grey">
                <Link to="/login">Login</Link>
              </p>
            </div>
          </div>
        </div>
        <ToastContainer />
      </section>
    );
  }
}

export default Register;
