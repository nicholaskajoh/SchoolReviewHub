import React, { Component } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import './ReportForm.css';
import APIHelper, { errors_to_array } from '../../api-helpers.js';


class ReportForm extends Component {
  constructor(props) {
    super(props);
    this.api = new APIHelper();
    this.state = {
      school: [],
      content: '',
      errors:[]
    };
  }

  componentWillReceiveProps(nextProps) {
    const id = nextProps.match.params.id;
    this.getSchool(id);
  }

  componentDidMount() {
    const id = this.props.match.params.id;
    this.getSchool(id);
  }

  async getSchool(id) {
    try
    {
      const res = await this.api.get(`school/${id}`);
      const school = res.data;
      this.setState({ school:school });
    }
    catch (e)
    {
      this.setState({ errors: errors_to_array(e) });
      toast.error('An error occured');
    }
  }

  handleChange = event => {
    this.setState({ content: event.target.value });
  };

  handleSubmit = event => {
    const data = { content: this.state.content, school: this.state.school.id };
    this.submitReport(data);
    event.preventDefault();
  };

  async submitReport(data) {
    try
    {
      const res = await this.api.post('add-report', data, true);
      toast.info('Report published, redirecting...');
      let func = this.props.history;
      window.setTimeout(function(){
        func.push(`../report/${res.data['id']}`);
      }, 3500);
    }
    catch (e)
    {
      this.setState({ errors: errors_to_array(e) });
      toast.error('An error occured');
    }
  }

  render() {
    return (
      <div>
        <section className="hero is-small is-warning is-bold">
          <div className="hero-body">
            <div className="container">
              <h1 className="title">Publish Report</h1>
            </div>
          </div>
          <ToastContainer autoClose={3000} position={toast.POSITION.TOP_CENTER}/>
        </section>
        <div className="section columns is-centered">
          <div className="column is-6">
            <p>
              You are about to publish a Report on
              <b> {this.state.school.name}</b>
            </p>
            <br />
            <form onSubmit={this.handleSubmit}>
              <textarea
                className="textarea"
                placeholder="Your Report"
                rows="10"
                value={this.state.content}
                onChange={this.handleChange}
                required    
              />
              <p className="help is-danger is-size-5">
                {this.state.errors}
              </p>
              <br/ >
              <div className="field is-grouped is-grouped-centered">
                <p className="control">
                  <button type="submit" className="button is-danger">
                    Publish
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default ReportForm;
