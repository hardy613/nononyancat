'use strict';

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var exec = _child_process2.default.exec;
var spawn = _child_process2.default.spawn;
var append = _fs2.default.appendFile;
var read = _fs2.default.readFile;
var env = process.env;
var linux = 'linux' === _os2.default.platform();
/**
 * callbacks
 */
function hasNyan(err, stdout, stderr, cb) {

	if (null === err && typeof stdout === 'string') {
		//they have been nyan'd
		console.log("nyancat found here: %s\nRemoving it now.\n", stdout);

		if (linux) {
			spawn('sudo', ['apt-get', 'purge', '-y', 'nyancat'], nyancatRemoved.bind(null, arguments));
		} else {
			exec('brew uninstall nyancat', nyancatRemoved.bind(null, arguments));
		}
	} else {
		console.log('No nyancat found.');
	}

	stopNyancatInstall(cb);
}

function nyancatRemoved(err, stdout, stderr, cb) {
	if (err) {
		return cb(err);
	}

	console.log('nyancat removed.');
}

function stopNyancatInstall(cb) {

	var file = linux ? '.bashrc' : '.bash_profile';
	var cmd = linux ? 'apt-get' : 'brew';

	read(env.HOME + '/' + file, function (err, data) {
		if (err) {
			return cb(err);
		}

		if (/^alias\s+(brew|apt-get)/.test(data)) {
			return cb();
		}

		append(env.HOME + '/' + file, 'alias ' + cmd + '=\'nononyancatbrew\'', cb);
	});
}

function start(cb) {
	exec('which nyancat', function (err, stdout, stderr) {
		hasNyan(err, stdout, stderr, cb);
	});
}

function end(err) {
	if (err) {
		console.error(err);
		process.exit(1);
	} else {
		console.log('Good to go.');
		process.exit(0);
	}
};

start(end);