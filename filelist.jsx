var Components = Components || {};
Components.FileButton = React.createClass({
    render: function() {
        return (
            <button type="button" className={this.props.buttonClass + " list-group-item"} onClick={this.handleClick}>{this.props.filetitle}</button>
        );
    },
    handleClick: function (event) {
        this.props.onClick(this.props.filetitle);
    }
});

Components.FileList = React.createClass({
    getInitialState: function () {
        return { files: Data.files };
    },
    render: function () {
        var buttons = this.state.files.map(function (file) {
            return (
                <Components.FileButton key={file.title} buttonClass={this.props.buttonClass} filetitle={file.title} onClick={this.props.onClick}/>
            );
        }.bind(this));
        return (
            <div className="list-group">
              {buttons}
            </div>
        );
    },
});
