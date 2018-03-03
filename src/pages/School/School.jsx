import React, { Component } from 'react';
import Heading from './Heading';
import Highlights from './Highlights';
import Reviews from './Reviews';
import Reports from './Reports';
import './School.css';
import { toast, ToastContainer } from 'react-toastify';
import APIHelper, { errors_to_array } from '../../api-helpers.js';


class School extends Component {
  constructor(props) {
    super(props);
    this.api = new APIHelper();
    this.state = {
      school: {},
      lowerRatedSchools: [],
      numLowerRatedSchools: 0,
      isLoaded: false,
      toastId: null,
      errors: []
    };
    this.toastId = toast();
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const schoolId = nextProps.match.params.id;
    this.getSchool(schoolId);
    this.getLowerRatedSchools(schoolId);
  }

  componentDidMount() {
    const schoolId = this.props.match.params.id;
    this.getSchool(schoolId);
    this.getLowerRatedSchools(schoolId);
    window.scrollTo(0, 0);
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
      this.setState({ errors: errors_to_array(e), isLoaded: false });
      if (toast.isActive(this.state.toastId))
      {
        toast.update(
          this.state.toastId,
          {
            render: `${this.state.errors}`,
            type: toast.TYPE.ERROR,
          }
        )
      }
      else
      {
        this.setState({ 
          toastId:toast.error(`${this.state.errors}`)
        });
      }
    }
  }

  async getLowerRatedSchools(id) {
    try
    {
      const res = await this.api.get(`rated-higher-than/${id}`);
      let lowerRatedSchools = res.data;
      const numLowerRatedSchools = lowerRatedSchools.length;
      lowerRatedSchools = lowerRatedSchools.slice(0, 3);
      this.setState({ lowerRatedSchools:lowerRatedSchools,
        numLowerRatedSchools:numLowerRatedSchools, isLoaded:true
       });
    }
    catch (e)
    {
      this.setState({ errors: errors_to_array(e), isLoaded: false });
      if (toast.isActive(this.state.toastId) || this.state.toastId)
      {
        toast.update(
          this.state.toastId,
          {
            render: `${this.state.errors}`,
            type: toast.TYPE.ERROR,
          }
        )
      }
      else
      {
        this.setState({ 
          toastId:toast.error(`${this.state.errors}`)
        });
      }
    }
  }

  render() {
    let rendering;
    if (this.state.isLoaded)
    {
      rendering = 
      <div>
      <Heading school={this.state.school} />

        <Highlights
          school={this.state.school}
          lowerRatedSchools={this.state.lowerRatedSchools}
          numLowerRatedSchools={this.state.numLowerRatedSchools}
        />
        <Reviews schoolId={this.props.match.params.id} />

        <Reports schoolId={this.props.match.params.id} />
        </div>
    }
    else
    {
    rendering = 
      <div title="Reload" className="has-text-centered">
      <button className="reload-btn" onClick={this.componentDidMount}>
        <i className="fa fa-redo-alt fa-2x" />
      </button>
      </div>
    }
    return (
      <div>
        <ToastContainer autoClose={3000} position={toast.POSITION.TOP_CENTER}/>
        <br />
        { rendering }
      </div>
    );
  }
}

export default School;
