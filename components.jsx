var Components = Components || {};

Components.SelectDropdown = React.createClass({
    getDefaultProps: function () {
        return {
            options: [],
            className: ""
        };
    },
    getInitialState: function () {
        this.value = this.props.defaultValue || this.options[0];
        return {};
    },
    componentDidMount: function () {
    },
    render: function () {
        var options = this.props.options.map(function (option) {
            return (<option key={option} >{option}</option>)
        }.bind(this));
        return (<select defaultValue={this.props.defaultValue} className={this.props.className} onChange={this.handleChange}>{options}</select>);
    },
    handleChange: function (e) {
        var node = React.findDOMNode(this);
        this.value = node.value;
        if (this.props.onChange)
            this.props.onChange(node.value);
    }
});


Components.FileList = React.createClass({
    getInitialState: function () {
        return { files: Data.files };
    },
    render: function () {
        var options = this.state.files.map(function (file) {return file.title});
        return (
            <div>
            <p> File:
            <Components.SelectDropdown options={options} defaultValue={this.props.defaultValue} onChange={this.props.onClick} />
            </p>
            </div>
        );
    },
});
