var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');

var Cat = mongoose.model('Cssat', {
	name: String
});

var kitty = new Cat({
	name: 'Zildjian'
});
kitty.save(function(err) {
	if (err) // ...
		console.log('meow');
	else {
		console.log('saved');
	}
});
mongoose.