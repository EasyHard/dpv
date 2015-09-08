var Components = Components || {};
Components.FileList = React.createClass({
    getInitialState: function () {
        return {files: [
            {title: "file title 1"},
            {title: "file title 2"},
            {title: "file title 3"},
        ]};
    },
    render: function () {
        var buttons = this.state.files.map(function (file) {
            return (
               <button type="button" className={this.props.buttonClass + " list-group-item"} >{file.title}</button>
            );
        }.bind(this));
        return (
            <div className="list-group">
              {buttons}
            </div>
        );
    },
});
