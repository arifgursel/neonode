myApp.filter('reverse', function() {
	return function(items){
		if (items === undefined) { items = []; }
		return items.reverse();
	};
});