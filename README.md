Overview
----------
Dynamic programming (a.k.a memoization) is a very popular topic in
algorithm courses and job interviews. Because a dynamic programming (DP) solution
always shows some key insight of the correspond problem. i.e. a "bigger" problem
could be recursively solved by "sum up" answers of several "smaller" similar
problems. But in another way, a DP solution also involves implement techs like
memoization or rolling array, which makes the implementation in C++/Java usually
not as clear as the original idea.

So I wonder if it is possible to 

1.design a language which is pretty much as clear
as the original idea of how to recursively solve the problem. 

2.By static analysis and run-time analysis, the evaluation of the implement
will not only give your the answer, but also give a lot of information of how
the problem is solved.

3.And using these information, I could visualize the progress of the
solution in a single webpage.

memofunction
------
`dpv` is a on-going project for these targets, which introduces a new keyword
`memofunction` to JavaScript. Besides of one thing,
`memofunction` is just the same as `function`. Any function declared by `memofunction`
will be automatically memoizated.  i.e. if you put the same argument to a
`memofunction` twice, the later function calling will not be calculated. Instead, the
interpreter gives the same result as the first time.

By doing this, you can write a DP solution without all the bookkeepings.
Ideas could be expressed more clearly and easily.

I modified `acorn.js` for parser side support and modified `NeilFraser/JS-Interpreter` 
for interpreter side support. Feel free to check the modified version in `deps/interpreter/`.


run-time analysis
-------
The other benefit from `memofunction` is that now the execution of a DP solution could be
monitored and recorded. The stack of memofunction could help to find out *run-time dependencies*
for each cells (pairs of arguments) of `memofunction`, start point, and boundary. These
are very hard to be found by static analysis.

visualization
--------
With the information above, visualization becomes very easy. Three visualization is implemented,

* BFS, BFS from start points. It shows how the problem could be solved if you have non deterministic brain ^_^.
* Topo, Topography order starting from boundary. It shows how to solve the problem with unlimited number of cores.
* Program order, the order of the implement actually solving it.



limitations and unimplemented features
------
Though the run-time analysis and interpreter support `memofunction` with more than two arguments,
I have not find a nice way to present a cube in web page. So for visualization, it can be no more
that two arguments for now.

And only matrix is used to visualize the memoization bookkeepings, so `memofunction` with Non-`Number`
can not be visualize.

There are also two features I have not implemented yet.

* Find out input-independent dependencies.
For now only run-time dependencies are captured since dependencies are referred by stack trace. For
problems like 0-1 knapsack, function calls could be ruled out for the current input, but happened
in other inputs. Capturing these dependencies are also important.

One way is to 

* "Best" solving order
Many dynamic programming solutions could be implemented with rolling an array to reduce space
requirement. To demonstrate such possibility, I want to animator the the solving process with
a "best" trace. By "best" here it means with minimum memory footprint. I feel this feature
could be very useful. Feel free to open an issue or contact me if you have any idea.
