var Task = React.createClass({
  rawMarkup: function() {
    var md = new Remarkable();
    var rawMarkup = md.render(this.props.children.toString());
    return { __html: rawMarkup };
  },

  render: function() {
    return (
      <div className="task">
        <div className="task__date">
          {this.props.author}
        </div>
        <div className="task__name" dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    );
  }
});

var TaskBox = React.createClass({
  loadTasksFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleTaskSubmit: function(task) {
    var tasks = this.state.data;
    task.id = Date.now();
    var newTasks = tasks.concat([task]);
    this.setState({data: newTasks});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: task,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: tasks});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadTasksFromServer();
    setInterval(this.loadTasksFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="tasks__wrapper">
        <div className="tasks__header">
          Список дел
        </div>
        <TaskList data={this.state.data} />
        <TaskForm onTaskSubmit={this.handleTaskSubmit} />
      </div>
    );
  }
});

var TaskList = React.createClass({
  render: function() {
    var taskNodes = this.props.data.map(function(task) {
      return (
        <Task author={task.author} key={task.id}>
          {task.text}
        </Task>
      );
    });
    return (
      <div className="tasks__list">
        {taskNodes}
      </div>
    );
  }
});

var TaskForm = React.createClass({
  getInitialState: function() {
    return {author: '', text: ''};
  },
  handleAuthorChange: function(e) {
    this.setState({author: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var text = this.state.text.trim();
    if (!text || !author) {
      return;
    }
    this.props.onTaskSubmit({author: author, text: text});
    this.setState({author: '', text: ''});
  },
  render: function() {
    return (
      <form className="tasks__form" onSubmit={this.handleSubmit}>
        <input
          type="date"
          placeholder="Дата: dd/mm/YYYY"
          className="form__input form__input--date"
          value={this.state.author}
          onChange={this.handleAuthorChange}
          required="true"
        />
        <input
          type="text"
          placeholder="Что вы планируете сделать?"
          className="form__input form__input--text"
          value={this.state.text}
          onChange={this.handleTextChange}
          required="true"
        />
        <input
          type="submit"
          className="form__button"
          value="Добавить"
        />
      </form>
    );
  }
});

ReactDOM.render(
  <TaskBox url="/api/comments" pollInterval={2000} />,
  document.getElementById('container')
);
