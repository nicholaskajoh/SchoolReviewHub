import React, { Component } from 'react';
import './Report.css';
import CommentCard from './../../partials/CommentCard/CommentCard';
import { ToastContainer, toast } from 'react-toastify';
import APIHelper, { errors_to_array } from '../../api-helpers.js';
import ObjectNotFound from './../ObjectNotFound/ObjectNotFound';
import { Link } from "react-router-dom";


class Report extends Component {
  constructor(props) {
    super(props);
    this.api = new APIHelper();
    this.state = {
      report: { created_at: '' },
      own_report: false,
      editing: false,
      edited_report_content: '',
      submitting_edit: '',
      school_name: '',
      school_id: '',
      comments: [],
      comment: '',
      isloading: '',
      isLoaded: false,
      errorLoading: false,
      current_page: 0,
      has_more_comments: false,
      upvoted: false,
      upvoting: '',
      commenting: '',
      toastId: null,
      errors: [],
      notFound: false,
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.upvoteComment = this.upvoteComment.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const reportId = nextProps.match.params.id;
    if (!isNaN(Number(reportId))) {
      this.setState({ errorLoading: false });
      this.getReport(reportId);
      this.getComments(reportId);
      this.checkUpvote(reportId);
      this.checkOwner(reportId);
      window.scrollTo(0, 0);
    }
    else {
      this.setState({ notFound: true });
    }
  }

  componentDidMount() {
    const reportId = this.props.match.params.id;
    if (!isNaN(Number(reportId))) {
      this.setState({ errorLoading: false });
      this.getReport(reportId);
      this.getComments(reportId);
      this.checkUpvote(reportId);
      this.checkOwner(reportId);
      window.scrollTo(0, 0);
    }
    else {
      this.setState({ notFound: true });
    }
  }

  async getReport(id) {
    try {
      const res = await this.api.get(`report/${id}`);
      const report = res.data;
      const school_name = res.data.school.name;
      const school_id = res.data.school.id;
      this.setState({
        report: report,
        school_name: school_name,
        edited_report_content: report.content,
        school_id: school_id,
        isLoaded: true,
        errorLoading: false,
        errors: []
      });
    }
    catch (e) {
      let errors = errors_to_array(e);
      this.setState({ errors: errors, isLoaded: false, errorLoading:true });
      if (errors === 404) {
        this.setState({ notFound: true });
      }
      if (toast.isActive(this.state.toastId)) {
        toast.update(
          this.state.toastId,
          {
            render: `${this.state.errors}`,
            type: toast.TYPE.ERROR,
          }
        )
      }
      else {
        this.setState({
          toastId: toast.error(`${this.state.errors}`)
        });
      }
    }
  }

  async getComments(id) {
    try {
      const res = await this.api.get(`report/${id}/comments/1`);
      const comments = res.data;
      const has_more_comments =
        res.headers['x-has-next'].toLowerCase() === 'true';
      const current_page = 1;

      this.setState({
        comments: comments,
        current_page: current_page,
        has_more_comments: has_more_comments,
        isLoaded: true, errors: [],
        errorLoading: false
      });
    }
    catch (e) {
      this.setState({ errors: errors_to_array(e), isLoaded: false, errorLoading: true });
      if (toast.isActive(this.state.toastId) || this.state.toastId) {
        toast.update(
          this.state.toastId,
          {
            render: `${this.state.errors}`,
            type: toast.TYPE.ERROR,
          }
        )
      }
      else {
        this.setState({
          toastId: toast.error(`${this.state.errors}`)
        });
      }
    }
  }

  async checkUpvote(id) {
    try {
      await this.api.get(`check-upvote/${id}/report`, true);
      this.setState({ upvoted: true });
    }
    catch (e) {
      this.setState({ upvoted: false });
    }
  }

  async checkOwner(id) {
    try {
      await this.api.get(`check-owner/${id}/report`, true);
      this.setState({ own_report: true });
    }
    catch (e) {
      this.setState({ own_report: false });
    }
  }

  async getMoreComments(id, page) {
    try {
      const res = await this.api.get(`report/${id}/comments/${page}`);

      let comments = res.data;
      let old_comments = this.state.comments;
      comments = old_comments.concat(comments);
      const has_more_comments =
        res.headers['x-has-next'].toLowerCase() === 'true';
      const current_page = page;
      this.setState({
        comments: comments,
        current_page: current_page,
        has_more_comments: has_more_comments,
        isLoading: '', errors: [], errorLoading: false
      });
    }
    catch (e) {
      this.setState({ errors: errors_to_array(e) });
      if (toast.isActive(this.state.toastId)) {
        toast.update(
          this.state.toastId,
          {
            render: `${this.state.errors}`,
            type: toast.TYPE.ERROR,
          }
        )
      }
      else {
        this.setState({
          toastId: toast.error(`${this.state.errors}`)
        });
      }
    }
  }

  handleClick = event => {
    this.setState({ isLoading: 'is-loading' });
    this.getMoreComments(this.state.report['id'], this.state.current_page + 1);
  };

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  handleEdit = event => {
    if (this.state.own_report)
      this.setState({ editing: true });
  }

  handleSubmit = event => {
    this.setState({ commenting: 'is-loading' });
    const data = {
      comment: this.state.comment,
      entity_id: this.state.report['id'],
      entity: 'report'
    };
    this.submitComment(data);
    event.preventDefault();
  };

  handleEditSubmit = event => {
    if (this.state.edited_report_content === this.state.report.content) {
      toast.error('You have not made any change');
      event.preventDefault();
    }
    else {
      this.setState({ submitting_edit: 'is-loading' });
      const data = {
        id: this.state.report.id,
        content: this.state.edited_report_content,
        school: this.state.school_id
      };
      this.submitEditedReport(data);
      event.preventDefault();
    }
  };

  handleUpvote = event => {
    this.setState({ upvoting: 'is-loading' });
    this.upVote(this.state);
  };

  cancelEdit = () => {
    this.setState({ editing: false, edited_report_content: this.state.report.content });
  };

  async submitComment(data) {
    try {
      await this.api.post('add-comment', data, true);

      const reportId = this.state.report['id'];
      toast.info('Comment added');
      this.getReport(reportId);
      this.getComments(reportId);
      this.setState({ comment: '', errors: [], commenting: '' });
    }
    catch (e) {
      this.setState({ errors: errors_to_array(e), commenting: '' });
      if (toast.isActive(this.state.toastId)) {
        toast.update(
          this.state.toastId,
          {
            render: 'An error occured',
            type: toast.TYPE.ERROR,
          }
        )
      }
      else {
        this.setState({
          toastId: toast.error('An error occured')
        });
      }
    }
  }

  async submitEditedReport(data) {
    try {
      const res = await this.api.post('add-report', data, true);

      toast.info('Report edited');
      this.setState({ editing: false, submitting_edit: false, report: res.data })
    }
    catch (e) {
      this.setState({ errors:errors_to_array(e), submitting_edit: false });
      if (toast.isActive(this.state.toastId)) {
        toast.update(
          this.state.toastId,
          {
            render: `${this.state.errors}`,
            type: toast.TYPE.ERROR,
          }
        )
      }
      else {
        this.setState({
          toastId: toast.error(`${this.state.errors}`)
        });
      }
    }
  }

  toggleUpvote() {
    if (this.state.upvoted === true)
      return false;
    return true;
  }

  async upVote(data) {
    try {
      await this.api.get(`upvote/${data.report['id']}/report`, true);

      if (this.toggleUpvote() === true) { toast.info('Upvoted'); }
      else { toast.info('Removed Upvote'); }

      const reportId = this.state.report['id'];
      this.getReport(reportId);
      this.setState({ upvoted: this.toggleUpvote(), errors: [], upvoting: '' });
    }
    catch (e) {
      this.setState({ errors: errors_to_array(e), upvoting: '' });
      if (toast.isActive(this.state.toastId) || this.state.toastId) {
        toast.update(
          this.state.toastId,
          {
            render: `${this.state.errors}`,
            type: toast.TYPE.ERROR,
          }
        )
      }
      else {
        this.setState({
          toastId: toast.error(`${this.state.errors}`)
        });
      }
    }
  }

  async upvoteComment(comment_id)
  {
    try {
      const res = await this.api.get(`upvote/${comment_id}/comment`, true);
      let comments = this.state.comments;
      for (let i = 0; i < comments.length; i++) {
        if (comment_id === comments[i]['id']) {
          comments[i]['upvotes'] += res.data['type'];
          break;
        }
      }
      this.setState({ comments: comments });
      // if (this.toggleUpvote() === true) { toast.info('Upvoted'); }
      // else { toast.info('Removed Upvote'); }

      // const reportId = this.state.report['id'];
      // this.getReport(reportId);
      // this.setState({ upvoted: this.toggleUpvote(), errors: [], upvoting: '' });
    }
    catch (e) {
      this.setState({ errors: errors_to_array(e)});
      if (toast.isActive(this.state.toastId) || this.state.toastId) {
        toast.update(
          this.state.toastId,
          {
            render: `${this.state.errors}`,
            type: toast.TYPE.ERROR,
          }
        )
      }
      else {
        this.setState({
          toastId: toast.error(`${this.state.errors}`)
        });
      }
    }
  }

  render() {
    if (this.state.notFound) {
      return <ObjectNotFound object_model="Report" />;
    }

    let rendering;
    if (this.state.isLoaded) {
      rendering =
        <div className="container">
          <div className="columns">
            <div className="column" />

            <div className="column is-half">
              <div className="content">
                <p className="title has-text-centered">
                  <Link
                    className="has-text-black"
                    to={"/school/" + this.state.school_id}
                  >{this.state.school_name}</Link>
                  {' '}Report
                </p>
              </div>
            </div>

            <div className="column" />
          </div>

          <div className="report-body">
            <div className="box">
              <div className="media-content">
                <div className="content has-text-centered">
                  {this.state.editing ? (
                  <form onSubmit={this.handleEditSubmit}>
                      <div className="field">
                        <div className="control">
                          <textarea
                            className="textarea"
                            type="text"
                            name="edited_report_content"
                            value={this.state.edited_report_content}
                            onChange={this.handleChange}
                            placeholder="Write a report"
                            required
                          />
                        </div>
                        <br />
                        {this.state.errors.map((error, index) => (
                          <p key={'edit_report_error ' + index} className="help is-danger is-size-5">
                            {error}
                          </p>
                        ))}
                        <div className="field is-grouped is-grouped-centered">
                          <p className="control">
                            <button type="submit" className={"button is-success is-small " + this.state.submitting_edit}>
                              <i className="far fa-check-circle"></i>&nbsp;Submit
                            </button>
                          </p>
                          <p className="control">
                            <button onClick={this.cancelEdit} className="button is-small is-warning">
                              <i className="fas fa-ban"></i>&nbsp;Cancel
                            </button>
                          </p>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <p className="subtitle has-text-weight-light" onClick={this.handleEdit}>
                        "{this.state.report.content}"
                      </p>
                    )}
                </div>
                <hr />
                <nav className="level">
                  <div className="level-left">
                    <div className="level-item has-text-dark">
                      {this.state.upvoted ? (
                        <button
                          className={"button is-default is-small " + this.state.upvoting}
                          onClick={this.handleUpvote}>
                          Remove upvote
                      </button>
                      ) : (
                          <button className={"button is-danger is-small " + this.state.upvoting}
                            onClick={this.handleUpvote}>
                            Upvote
                        </button>
                        )}
                      &nbsp;{this.state.report.upvotes}
                    </div>
                  </div>

                  {this.state.own_report ? (
                    <div className="level-right">
                      <div className="level-item has-text-dark">
                        <button title="Edit this report"
                          className={"button is-default is-small " + this.state.editing}
                          onClick={this.handleEdit}>
                          <i className="far fa-edit"></i>
                        </button>
                      </div>
                    </div>
                  ) : (
                      ''
                    )}
                </nav>
              </div>
            </div>


            <div className="gap-medium"></div>

            <div className="report-section">
              <h3 className="title">Your view?</h3>

              <hr />

              <p>
                What's your opinion? Do you feel this report is rightly
              spoken? Why not let others see the other side of the coin
              through your perspective.
              </p>

              <br />
              <form onSubmit={this.handleSubmit}>
                <div className="field">
                  <div className="control">
                    <textarea
                      className="textarea"
                      type="text"
                      name="comment"
                      value={this.state.comment}
                      onChange={this.handleChange}
                      placeholder="Write a comment"
                      required
                    />
                  </div>
                  {this.state.errors.map((error, index) => (
                    <p key={'report_error ' + index} className="help is-danger is-size-5">
                      {error}
                    </p>
                  ))}
                  <br />
                  <div className="field is-grouped is-grouped-centered">
                    <p className="control">
                      <button type="submit" className={"button is-warning " + this.state.commenting}>
                        <i className="fa fa-comment"></i> &nbsp;Post Comment
                    </button>
                    </p>
                  </div>
                </div>
              </form>

              <div className="gap-medium"></div>

              <h3 className="title">Comments
                ({this.state.report.comments_count})
              </h3>

              <hr />
              <br />

              {this.state.comments.map(comment => (
                <CommentCard key={'report_comment ' + comment.id} comment={comment} upvote={this.upvoteComment} />
              ))}

            </div>
            {this.state.has_more_comments ? (
              <div className="field is-grouped is-grouped-centered">
                <p className="control">
                  <button
                    className={"button is-danger " + this.state.isLoading}
                    id="post-comment-btn"
                    onClick={this.handleClick}
                  >
                    Load more comment
                </button>
                </p>
              </div>
            ) : (
              <div className="field is-grouped is-grouped-centered">
                <p className="control">
                  {/* <button
                    className="button is-danger"
                    id="post-comment-btn" disabled
                  >
                    Load more comment
                  </button> */}
                  <div className="has-text-centered">
                    <i className="fab fa-pied-piper-alt fa-7x"></i>
                    <br /><br />
                    <p>
                      <em>The end...</em>
                    </p>
                  </div>
                </p>
              </div>
              )}
          </div>
        </div >
    }
    else if (this.state.errorLoading) {
      rendering =
        <div className="has-text-centered">
          <button title="Reload" className="reload-btn" onClick={this.componentDidMount}>retry</button>
        </div>
    }
    else {
      rendering =
        <div className="has-text-centered">
          <button className="reload-btn loading">...</button>
        </div>
    }

    return (
      <div>
        <section className="hero is-small is-warning is-bold">
          <div className="hero-body">
            <div className="container">
              <h1 className="title"><i className="fa fa-microphone" /> Report</h1>
            </div>
          </div>
          <ToastContainer
            autoClose={3000}
            position={toast.POSITION.TOP_CENTER}
          />
        </section>
        <div className="section">
          {rendering}
        </div>
      </div>
    );
  }
}
export default Report;
