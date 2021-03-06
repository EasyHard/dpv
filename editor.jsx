var Components = Components || {};

Components.Editor = React.createClass({
    getDefaultProps: function() {
        return {
            theme: "ace/theme/chrome",
            waitForChange: 2000,
            name: "editor",
            defaultFile: "fib.js",
        };
    },
    getInitialState: function () {
        return {
            interpreterStatus: "idle"
        };
    },
    getInterpreterMessage: function () {
        if (this.state.interpreterStatus === "idle") {
            return "Idle......";
        } else if (this.state.interpreterStatus === "running") {
            return "Running......";
        } else {
            return "Error: " + this.state.interpreterError.toString();
        }
    },
    componentDidMount: function () {
        this.editor = ace.edit(this.props.name);
        this.editor.setTheme(this.props.theme);
        this.editor.getSession().setMode("ace/mode/javascript");
        this.editor.getSession().on("change", this.onTextChange);
        this.openFile(this.props.defaultFile);
        this.waitForChange = Number(this.props.waitForChange);
        this.interpreterTimer = null;
        if (window.Worker) {
            this.worker = new Worker('./interpreterWorker.js');
            this.worker.onmessage = this.handleMessage;
        }
    },
    handleMessage: function (e) {
        console.log('onmesssage back');
        if (e.data.err) {
            console.log('worker error:', e.data.err);
            this.setState({interpreterStatus: 'error', interpreterError: e.data.err});
        } else {
            this.setState({interpreterStatus: 'idle'});
            this.analyzer = e.data.analyzer;
            this.present();
        }
    },
    present: function () {
        console.log('value', this.refs.pickAnimator.value);
        React.unmountComponentAtNode(document.getElementById('presenter'));
        React.render(<Components.Presenter analyzer={this.analyzer} animator={animators[this.refs.pickAnimator.value]}/>, document.getElementById('presenter'));
    },
    render: function () {
        return (
            <div>
            <Components.FileList onClick={this.openFile} defaultValue={this.props.defaultFile} > </Components.FileList>
            <div id={this.props.name}> </div>
            <code>
            Interperter Status: {this.getInterpreterMessage()}
            </code>
            <div style={{"padding-top":"14px"}} >
            <p>
            <h4><b>Pick a Animator: <Components.SelectDropdown options={Object.keys(animators)} ref="pickAnimator" defaultValue="topo" onChange={this.present} /> </b></h4>
            </p>
            </div>
            </div>

        );
    },
    openFile: function (fileTitle) {
        var data = null;
        Data.files.forEach(function (file) {
            if (file.title === fileTitle) {
                data = file;
            }
        });
        if (data) {
            this.editor.setValue(data.content);
        } else {
            // TODO: handle error
        }
    },
    onTextChange: function (e) {
        console.log('changed');
        if (this.interpreterTimer) {
            clearTimeout(this.interpreterTimer);
        }
        this.interpreterTimer = setTimeout(this.issueInterpreter, this.waitForChange);
    },
    issueInterpreter: function () {
        this.interpreterTimer = null;
        this.setState({interpreterStatus: 'running'});
        this.worker.postMessage(this.editor.getValue());
    },
});

React.render(<Components.Editor defaultFile="CombinationCalculator.js" name="editor" />, document.getElementById('editor-wrap'))