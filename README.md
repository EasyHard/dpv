Dynamic programming (a.k.a memorized searching) is a very popular topic in
algorithm courses and job interviews. Because a dynamic programing(dp) solution
always shows some key insight of the correspond problem. i.e. a "bigger" problem
could be recusively solved by "sum up" answers of serveral "smaller" similar
problems. But in another way, a dp solution also invovles implement techs like
memorizing, which makes the implment code in C++/Java usually not as clear as
the original idea.

So I wonder if it is possible to 

1.design a language which is pretty much as clear
as the idea of how to recusively solve the problem. 

2.And by running the code, it
will not only give your the answer, but also a step by step record of how the
problem is solved. 

3.And using that record, *I could visualize the progress of the
dp solution in a single webpage*.

`dpv` is a on-going project for these targets. Target 1 and 2 are finished by
adding a new keyword `memofunction` in JavaScript. The usage of `memofunction`
is the same as `function`. In addition, any function declared by `memofunction`
will be automatically memorized. i.e. if you put the same argument to a
`memofunction` twice, the later one will not be calculated. Instead, the
interpreter gives the same result as the first one.

I modified `acorn.js` for parse support and `NeilFraser/JS-Interpreter` to get
the rest jobs done. You can check
https://github.com/EasyHard/JS-Interpreter/tree/dp to see what those
modification are.

And to visualize the progress, I got a very iitial idea and implement it in
index.html. That page is on-going but feel free to look around.

