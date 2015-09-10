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
        } else {
            this.analyzer = e.data.analyzer;
            this.present();
        }
    },
    present: function () {
        console.log('value', this.refs.pickAnimator.value);
        React.unmountComponentAtNode(document.getElementById('presenter'));
        React.render(<Components.Presenter analyzer={this.analyzer} animator={animators[this.refs.pickAnimator.value]}/>, document.getElementById('presenter'));
    },
    optionChange: function () {

    },
    render: function () {
        return (
            <div>
            <Components.FileList onClick={this.openFile} defaultValue={this.props.defaultFile} > </Components.FileList>
            <p>Animator: <Components.SelectDropdown options={Object.keys(animators)} ref="pickAnimator" defaultValue="topo" onChange={this.present} /></p>
            <div id={this.props.name} /> </div>

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
        this.worker.postMessage(this.editor.getValue());
    },
});

React.render(<Components.Editor defaultFile="counting.js" name="editor" />, document.getElementById('editor-wrap'))