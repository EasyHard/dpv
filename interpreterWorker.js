importScripts('./analyzer.js', './deps/interpreter/acorn.js', './deps/interpreter/interpreter.js');
onmessage = function (event) {
  var code = event.data;
  // TODO: Interpreter needs a timeout in case it never halt.
  var interpreter = new Interpreter(code);
  var err;
  // try {
  console.log('onmessage worker');
  try {
    interpreter.run(30000);
  } catch (e) {
    err = e;
    postMessage({err: e.toString()});
  }
  if (err) return;
  console.log('after run');
  var analyzer = new StackAnalyzer(interpreter);
  console.log('ana');
  analyzer.interpreter = null;
  console.log(analyzer);
  postMessage({err: null, analyzer: analyzer});
  // } catch (err) {
  //   throw err;
  //   postMessage({err: err.toString()});
  // }
};
