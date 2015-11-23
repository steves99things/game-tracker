function foo(cb) {
	var bar = 'bar';
	return cb(bar);
}

foo(function(number) {
	console.log(number);
});