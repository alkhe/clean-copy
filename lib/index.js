'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _path = require('path');

var _gracefulFs = require('graceful-fs');

var _fsPromise = require('fs-promise');

var P = function P(f) {
	return new Promise(f);
};

var mkdirp = function mkdirp(dir) {
	return (0, _fsPromise.mkdir)(dir).catch(function (err) {
		if (err.code !== 'EEXIST') return Promise.reject(err);
	});
};

var copy_child = function copy_child(i, o, filter) {
	return (0, _fsPromise.lstat)(i).then(function (s) {
		return (s.isDirectory() ? copy_dir : s.isSymbolicLink() ? copy_link : copy_file)(i, o, filter);
	});
};

var copy_children = function copy_children(i, o, children, filter) {
	return Promise.all(children.filter(filter).map(function (child) {
		return copy_child((0, _path.join)(i, child), (0, _path.join)(o, child), filter);
	}));
};

var copy_dir = function copy_dir(i, o, filter) {
	return mkdirp(o).then(function () {
		return (0, _fsPromise.readdir)(i);
	}).then(function (children) {
		return copy_children(i, o, children, filter);
	});
};

var copy_file = function copy_file(i, o) {
	return P(function (res, rej) {
		var r = (0, _gracefulFs.createReadStream)(i);
		var w = (0, _gracefulFs.createWriteStream)(o);

		r.on('error', rej);
		w.on('error', rej);

		w.once('finish', res);

		r.pipe(w);
	});
};

var copy_link = function copy_link(i, o) {
	return (0, _fsPromise.readlink)(i).then(function (link) {
		return (0, _fsPromise.symlink)(link, o);
	});
};

var contains = function contains(a, b) {
	a = a.split(_path.sep);
	b = b.split(_path.sep);
	for (var i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
			return false;
		}
	}
	return true;
};

exports.default = function (i, o) {
	var filter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {
		return true;
	};

	i = (0, _path.resolve)(i);
	o = (0, _path.resolve)(o);
	if (filter.constructor === RegExp) {
		var _context;

		filter = (_context = filter).test.bind(_context);
	}
	return contains(i, o) ? Promise.reject(new Error('output directory cannot be a child of input directory')) : copy_dir(i, o, filter);
};