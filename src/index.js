import cp from 'child_process';
import os from 'os';
import fs from 'fs';

const exec = cp.exec;
const spawn = cp.spawn;
const append = fs.appendFile;
const read = fs.readFile;
const env  = process.env;
const linux = 'linux' === os.platform();
const file = linux ? '.bashrc' : '.bash_profile';
const pathedFile = `${env.HOME}/${file}`;
const cmd = linux ? 'apt-get' : 'brew';
/**
 * callbacks
 */
function hasNyan (err, stdout, stderr, cb) {

	if(null === err && typeof stdout === 'string') {
		//they have been nyan'd
		console.log("nyancat found here: %s\nRemoving it now.\n", stdout);
		
		if(linux) {
			spawn('sudo',
				['apt-get', 'purge', '-y', 'nyancat'],
				nyancatRemoved.bind(null, arguments));
		} else {
			exec('brew uninstall nyancat', nyancatRemoved.bind(null, arguments));
		}
	} else {
		console.log('No nyancat found.');
	}

	stopNyancatInstall(cb);
}

function nyancatRemoved(err, stdout, stderr, cb) {
	if(err) {
		return cb(err);
	}

	console.log('nyancat removed.');
}

function stopNyancatInstall (cb) {

	read(pathedFile, (err, data) => {
		if (err) {
			return cb(err);
		}

		if(/^alias\s+(brew|apt-get)/.test(data)){
			return cb();
		}

		append(pathedFile, `alias ${cmd}='nononyancatbrew'`, cb);
	});
}

function start (cb) {
	exec('which nyancat', (err, stdout, stderr) => {
		hasNyan(err, stdout, stderr, cb);
	});
}

function end (err) {
	if(err) {
		console.error(err);
		process.exit(1);
	} else {
		console.log(`Please 'source ${pathedFile}' to complete installation.`);
		process.exit(0);
	}
};

start(end);
